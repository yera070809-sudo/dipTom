import { db } from "@/lib/db";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";
import { BulkImportDialog } from "@/components/admin/bulk-import-dialog";
import { ExportButton } from "@/components/admin/export-button";
import { EditUserDialog } from "@/components/admin/edit-user-dialog";

export default async function UsersPage() {
    const [users, groups] = await Promise.all([
        db.user.findMany({
            orderBy: { createdAt: 'desc' },
            include: { group: true }
        }),
        db.group.findMany({
            orderBy: { name: 'asc' }
        })
    ]);

    // Prepare data for export
    const exportData = users.map(user => ({
        "ID": user.id,
        "Имя": user.name,
        "Email": user.email,
        "Роль": user.role,
        "Группа": user.group?.name || "-",
        "Дата регистрации": format(new Date(user.createdAt), "dd.MM.yyyy HH:mm")
    }));

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Пользователи</h1>
                    <p className="text-muted-foreground text-sm">Управление всеми учетными записями в системе.</p>
                </div>
                <div className="flex items-center gap-4">
                    <ExportButton data={exportData} filename="users_list.xlsx" />
                    <BulkImportDialog type="USERS" />
                    <Link href="/admin/users/create">
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 font-bold">
                            Добавить пользователя
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border-none shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-foreground py-6">Имя</TableHead>
                            <TableHead className="font-bold text-foreground">Email</TableHead>
                            <TableHead className="font-bold text-foreground">Роль</TableHead>
                            <TableHead className="font-bold text-foreground">Группа</TableHead>
                            <TableHead className="font-bold text-foreground">Регистрация</TableHead>
                            <TableHead className="font-bold text-foreground text-right pr-6">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {users.map((user: any) => (
                            <TableRow key={user.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                <TableCell className="py-4 font-medium">{user.name || "Н/Д"}</TableCell>
                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400 border border-red-500/20' :
                                        user.role === 'TEACHER' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                            'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'
                                        }`}>
                                        {user.role === 'ADMIN' ? 'Админ' : user.role === 'TEACHER' ? 'Учитель' : 'Студент'}
                                    </span>
                                </TableCell>
                                <TableCell>
                                    {user.group ? (
                                        <span className="text-indigo-400 font-medium">{user.group.name}</span>
                                    ) : (
                                        <span className="text-muted-foreground/30">—</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-sm">
                                    {format(new Date(user.createdAt), "dd.MM.yyyy")}
                                </TableCell>
                                <TableCell className="text-right pr-6">
                                    <EditUserDialog
                                        user={{
                                            ...user,
                                            groupId: user.groupId
                                        }}
                                        groups={groups}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

