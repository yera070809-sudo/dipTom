import { db } from "@/lib/db";
import { User, BookOpen, GraduationCap, TrendingUp, ChevronRight, Activity } from "lucide-react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { ru } from "date-fns/locale";
import { AdminAnalytics } from "@/components/admin/admin-analytics";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
    const userCount = await db.user.count();
    const subjectCount = await db.subject.count();
    const groupCount = await db.group.count();

    const stats = [
        { label: "Всего пользователей", value: userCount, icon: User, color: "from-blue-500 to-indigo-500", href: "/admin/users" },
        { label: "Предметы", value: subjectCount, icon: BookOpen, color: "from-purple-500 to-pink-500", href: "/admin/subjects" },
        { label: "Группы", value: groupCount, icon: GraduationCap, color: "from-indigo-500 to-violet-500", href: "/admin/groups" },
    ];

    // Optimized: Attendance stats for charts (Last 7 days only)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentAttendances = await db.attendance.findMany({
        where: {
            scannedAt: {
                gte: sevenDaysAgo
            }
        },
        orderBy: { scannedAt: 'asc' },
        select: { scannedAt: true }
    });

    const dailyStatsMap = new Map<string, number>();
    recentAttendances.forEach(a => {
        const dateKey = format(a.scannedAt, "MMM d", { locale: ru });
        dailyStatsMap.set(dateKey, (dailyStatsMap.get(dateKey) || 0) + 1);
    });
    const chartData = Array.from(dailyStatsMap.entries()).map(([date, count]) => ({ date, count }));

    return (
        <div className="max-w-6xl mx-auto space-y-12">
            <div className="space-y-2">
                <h1 className="text-4xl md:text-5xl font-black tracking-tighter">
                    Панель <span className="gradient-text">Обзора</span>
                </h1>
                <p className="text-muted-foreground text-lg">Управляйте вашей академической экосистемой из центрального хаба.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {stats.map((stat, index) => (
                    <Link key={stat.label} href={stat.href}>
                        <Card className="glass-card hover:bg-white/10 transition-all group overflow-hidden border-none cursor-pointer">
                            <CardContent className="p-8 flex flex-col gap-4 relative">
                                <div className={`absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 group-hover:rotate-12 transition-transform`}>
                                    <stat.icon className="size-32" />
                                </div>
                                <div className={`size-12 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-white shadow-lg`}>
                                    <stat.icon className="size-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-widest">{stat.label}</p>
                                    <div className="flex items-center gap-2">
                                        <h2 className="text-4xl font-bold">{stat.value}</h2>
                                        <TrendingUp className="size-5 text-emerald-500" />
                                    </div>
                                </div>
                                <div className="flex items-center text-xs text-primary font-bold group-hover:gap-2 transition-all mt-4">
                                    ПОДРОБНЕЕ <ChevronRight className="size-4" />
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>

            <AdminAnalytics chartData={chartData} />

            {/* Quick Actions or System Health can be added here */}
            <div className="glass-card rounded-[2rem] p-12 border-none">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    <div className="space-y-4 text-center md:text-left">
                        <h2 className="text-3xl font-bold tracking-tight">Система работает стабильно</h2>
                        <p className="text-muted-foreground max-w-md">Все службы активны. В системе {userCount} активных пользователей.</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href="/admin/users/create" className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:scale-105 transition-transform shadow-xl shadow-primary/20">
                            Добавить пользователя
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

