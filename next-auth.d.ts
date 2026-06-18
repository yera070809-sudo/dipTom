import NextAuth, { DefaultSession } from "next-auth"
import { JWT } from "next-auth/jwt"

export type Role = "ADMIN" | "TEACHER" | "STUDENT"

export type ExtendedUser = DefaultSession["user"] & {
    role: Role
    id: string
}

declare module "next-auth" {
    interface Session {
        user: ExtendedUser
    }

    interface User {
        role: Role
    }
}

declare module "next-auth/jwt" {
    interface JWT {
        role?: Role
        id?: string
    }
}
