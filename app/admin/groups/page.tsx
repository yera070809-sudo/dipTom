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

export default async function GroupsPage() {
    const groups = await db.group.findMany({
        include: {
            _count: {
                select: { students: true }
            }
        },
        orderBy: { name: 'asc' }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Группы</h1>
                    <p className="text-muted-foreground text-sm">Управление студенческими группами.</p>
                </div>
                <Link href="/admin/groups/create">
                    <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 shadow-lg shadow-primary/20 transition-all hover:scale-105">
                        Добавить группу
                    </Button>
                </Link>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border-none shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-foreground py-6">Название</TableHead>
                            <TableHead className="font-bold text-foreground">Кол-во студентов</TableHead>
                            <TableHead className="text-right font-bold text-foreground">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {groups.map((group: any) => (
                            <TableRow key={group.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                <TableCell className="py-4 font-medium text-indigo-400">{group.name}</TableCell>
                                <TableCell className="font-medium">{group._count.students}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="hover:bg-white/10 text-muted-foreground hover:text-white" disabled>
                                        Изменить
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {groups.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                    Группы не найдены.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

