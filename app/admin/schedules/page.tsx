import { db } from "@/lib/db";
import { CreateScheduleForm } from "@/components/admin/create-schedule-form";
import { LessonGenerator } from "@/components/admin/lesson-generator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Trash2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteSchedule } from "@/actions/schedules";

const DAYS = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];

export default async function SchedulesPage() {
    const schedules = await db.schedule.findMany({
        include: {
            subject: true,
            teacher: true,
            group: true
        },
        orderBy: [
            { dayOfWeek: 'asc' },
            { startTime: 'asc' }
        ]
    });

    const subjects = await db.subject.findMany();
    const teachers = await db.user.findMany({ where: { role: "TEACHER" } });
    const groups = await db.group.findMany();

    return (
        <div className="space-y-12 max-w-6xl mx-auto pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    <CreateScheduleForm
                        subjects={subjects}
                        teachers={teachers}
                        groups={groups}
                    />
                </div>
                <div>
                    <LessonGenerator />
                </div>
            </div>

            <div className="space-y-6">
                <div className="flex justify-between items-end">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-black tracking-tight">Текущее расписание</h2>
                        <p className="text-muted-foreground">Список всех шаблонов для автоматической генерации.</p>
                    </div>
                </div>

                <div className="glass-card rounded-[2.5rem] overflow-hidden border-none shadow-2xl">
                    <Table>
                        <TableHeader className="bg-white/5">
                            <TableRow className="border-white/10 hover:bg-transparent">
                                <TableHead className="font-bold text-foreground py-6">День</TableHead>
                                <TableHead className="font-bold text-foreground">Время</TableHead>
                                <TableHead className="font-bold text-foreground">Предмет</TableHead>
                                <TableHead className="font-bold text-foreground">Учитель</TableHead>
                                <TableHead className="font-bold text-foreground">Группа</TableHead>
                                <TableHead className="text-right py-6"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {schedules.map((s) => (
                                <TableRow key={s.id} className="border-white/10 hover:bg-white/5 transition-colors group">
                                    <TableCell className="py-4">
                                        <span className="size-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-black text-xs">
                                            {DAYS[s.dayOfWeek]}
                                        </span>
                                    </TableCell>
                                    <TableCell className="font-mono text-sm">
                                        {s.startTime} – {s.endTime}
                                    </TableCell>
                                    <TableCell className="font-bold">{s.subject.name}</TableCell>
                                    <TableCell className="text-muted-foreground">{s.teacher.name}</TableCell>
                                    <TableCell>
                                        <span className="px-2 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 font-bold text-[10px] uppercase">
                                            {s.group.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <form action={async () => {
                                            "use server";
                                            await deleteSchedule(s.id);
                                        }}>
                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-red-400 hover:bg-red-500/10 rounded-xl">
                                                <Trash2 size={18} />
                                            </Button>
                                        </form>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {schedules.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-20 text-muted-foreground italic">
                                        <div className="flex flex-col items-center gap-2">
                                            <AlertCircle className="opacity-20" size={40} />
                                            Расписание пока не составлено
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
