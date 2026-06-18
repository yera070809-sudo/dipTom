import type { NextAuthConfig } from "next-auth"

export const authConfig = {
    pages: {
        signIn: "/login",
        error: "/auth/error", // Specific error page
    },
    // Required for Middleware to work in production/edge
    // Fallback secret for dev if env is missing, though we fixed .env
    secret: process.env.AUTH_SECRET || "dAdmBTD+SaO5TqrNP3lT0G+CvIE8EAORCMysixbfhWk=",
    session: { strategy: "jwt" },
    callbacks: {
        authorized({ auth, request: { nextUrl } }) {
            const isLoggedIn = !!auth?.user;
            const userRole = auth?.user?.role;

            const isOnDashboard = nextUrl.pathname.startsWith('/dashboard');
            const isOnAdmin = nextUrl.pathname.startsWith('/admin');
            const isOnTeacher = nextUrl.pathname.startsWith('/teacher');
            const isOnStudent = nextUrl.pathname.startsWith('/student');

            if (isOnDashboard || isOnAdmin || isOnTeacher || isOnStudent) {
                if (isLoggedIn) {
                    // Strict Role Checks
                    if (isOnAdmin && userRole !== "ADMIN") return false;
                    if (isOnTeacher && userRole !== "TEACHER") return false;
                    if (isOnStudent && userRole !== "STUDENT") return false;

                    return true;
                }
                return false; // Redirect unauthenticated users to login page
            }

            // Redirect logged-in users away from login page
            if (isLoggedIn && nextUrl.pathname === '/login') {
                if (userRole === "ADMIN") return Response.redirect(new URL('/admin', nextUrl));
                if (userRole === "TEACHER") return Response.redirect(new URL('/teacher', nextUrl));
                if (userRole === "STUDENT") return Response.redirect(new URL('/student', nextUrl));
                return Response.redirect(new URL('/dashboard', nextUrl));
            }

            return true;
        },
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.role = user.role as "ADMIN" | "TEACHER" | "STUDENT";
            }
            return token;
        },
        async session({ session, token }) {
            if (token.sub && session.user) {
                session.user.id = token.sub;
            }
            if (token.role && session.user) {
                session.user.role = token.role as "ADMIN" | "TEACHER" | "STUDENT";
            }
            return session;
        }
    },
    providers: [], // Providers added in auth.ts
} satisfies NextAuthConfig
