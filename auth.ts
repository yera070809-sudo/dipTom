import NextAuth from "next-auth"
import { authConfig } from "@/auth.config"
import Credentials from "next-auth/providers/credentials"
import { z } from "zod"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { LoginSchema } from "@/schemas";

// Separate file prevents accidentally importing 'db' into middleware via auth.config
export const { handlers, signIn, signOut, auth } = NextAuth({
    ...authConfig,
    providers: [
        Credentials({
            // Explicit name for clarity
            id: "credentials",
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    const validatedFields = LoginSchema.safeParse(credentials);

                    if (validatedFields.success) {
                        const { email, password } = validatedFields.data;

                        const user = await db.user.findUnique({
                            where: { email }
                        });

                        if (!user || !user.password) {
                            return null;
                        }

                        const passwordsMatch = await bcrypt.compare(
                            password,
                            user.password
                        );

                        if (passwordsMatch) {
                            // Return user object compatible with JWT callback
                            return {
                                id: user.id,
                                name: user.name,
                                email: user.email,
                                role: user.role as "ADMIN" | "TEACHER" | "STUDENT",
                            };
                        }
                    }
                    return null;
                } catch (error) {
                    console.error("Auth Error:", error);
                    return null;
                }
            }
        })
    ],
})
