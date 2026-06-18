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

import { BulkImportDialog } from "@/components/admin/bulk-import-dialog";

export default async function SubjectsPage() {
    const subjects = await db.subject.findMany({
        orderBy: { code: 'asc' }
    });

    return (
        <div className="space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-center">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight">Предметы</h1>
                    <p className="text-muted-foreground text-sm">Управление учебными дисциплинами.</p>
                </div>
                <div className="flex items-center gap-4">
                    <BulkImportDialog type="SUBJECTS" />
                    <Link href="/admin/subjects/create">
                        <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6 h-12 shadow-lg shadow-primary/20 transition-all hover:scale-105 font-bold">
                            Добавить предмет
                        </Button>
                    </Link>
                </div>
            </div>

            <div className="glass-card rounded-2xl overflow-hidden border-none shadow-2xl">
                <Table>
                    <TableHeader className="bg-white/5">
                        <TableRow className="border-white/10 hover:bg-transparent">
                            <TableHead className="font-bold text-foreground py-6">Код</TableHead>
                            <TableHead className="font-bold text-foreground">Название</TableHead>
                            <TableHead className="text-right font-bold text-foreground">Действия</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {subjects.map((subject: any) => (
                            <TableRow key={subject.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                <TableCell className="py-4 font-mono font-medium text-indigo-400">{subject.code}</TableCell>
                                <TableCell className="font-medium">{subject.name}</TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="sm" className="hover:bg-white/10 text-muted-foreground hover:text-white" disabled>
                                        Изменить
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {subjects.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                                    Предметы не найдены.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

