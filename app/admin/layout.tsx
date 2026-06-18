import { auth } from "@/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, BookOpen, GraduationCap, LogOut, Calendar, BarChart3, Settings } from "lucide-react";
import { logout } from "@/actions/logout";
import { Button } from "@/components/ui/button";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();
    if (!session?.user) redirect("/login");
    if (session.user.role !== "ADMIN") redirect("/dashboard");

    const navItems = [
        { href: "/admin", label: "Обзор", icon: LayoutDashboard },
        { href: "/admin/users", label: "Пользователи", icon: Users },
        { href: "/admin/subjects", label: "Предметы", icon: BookOpen },
        { href: "/admin/schedules", label: "Расписание", icon: Calendar },
        { href: "/admin/groups", label: "Группы", icon: GraduationCap },
        { href: "/admin/settings", label: "Настройки", icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#030303] text-white selection:bg-indigo-500/30">
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 blur-[120px] rounded-full animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="flex relative z-10 min-h-screen p-4 md:p-6 gap-6">
                <aside className="hidden lg:flex w-72 shrink-0 flex-col glass-card rounded-[2.5rem] border-white/5 shadow-2xl overflow-hidden sticky top-6 h-[calc(100vh-3rem)]">
                    <div className="p-8 border-b border-white/5 space-y-2">
                        <h2 className="text-2xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">
                            ImHere Admin
                        </h2>
                        <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-bold">Панель управления</p>
                    </div>

                    <nav className="flex-1 p-6 space-y-2">
                        {navItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className="flex items-center gap-4 px-6 py-4 rounded-3xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all border border-transparent hover:border-white/10 group"
                            >
                                <item.icon className="size-5 group-hover:scale-110 transition-transform" />
                                <span className="font-bold">{item.label}</span>
                            </Link>
                        ))}
                    </nav>

                    <div className="p-6 mt-auto border-t border-white/5 space-y-4 bg-white/5">
                        <div className="flex items-center gap-4 px-4">
                            <div className="size-10 rounded-2xl bg-gradient-to-br from-indigo-400 to-purple-600 flex items-center justify-center text-white font-black text-xl shadow-lg">
                                {session.user.name?.[0] || "A"}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold truncate">{session.user.name || "Админ"}</p>
                                <p className="text-[10px] text-muted-foreground font-mono truncate">{session.user.email}</p>
                            </div>
                        </div>
                        <form action={logout}>
                            <Button type="submit" variant="ghost" className="w-full justify-start gap-4 h-12 rounded-2xl hover:bg-red-500/10 hover:text-red-400 text-muted-foreground transition-all">
                                <LogOut className="size-5" />
                                <span className="font-bold text-sm">Выйти</span>
                            </Button>
                        </form>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col min-w-0">
                    <header className="lg:hidden glass-card rounded-3xl mb-6 p-4 flex justify-between items-center border-white/5 backdrop-blur-xl">
                        <h2 className="text-xl font-black tracking-tighter bg-gradient-to-r from-indigo-400 to-purple-500 bg-clip-text text-transparent">ImHere</h2>
                        <form action={logout}>
                            <Button type="submit" size="icon" variant="ghost" className="rounded-2xl hover:bg-white/5 text-muted-foreground">
                                <LogOut className="size-5" />
                            </Button>
                        </form>
                    </header>

                    <div className="p-2">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
