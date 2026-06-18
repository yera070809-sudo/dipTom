"use server";

import * as z from "zod";
import { LoginSchema } from "@/schemas";
import { signIn } from "@/auth";
import { AuthError } from "next-auth";

// Tip: Using a consistent return type helps client-side error handling
export const login = async (values: z.infer<typeof LoginSchema>) => {
    const validatedFields = LoginSchema.safeParse(values);

    if (!validatedFields.success) {
        return { error: "Некорректные данные!" };
    }

    const { email, password } = validatedFields.data;

    try {
        await signIn("credentials", {
            email,
            password,
            redirectTo: "/dashboard",
        });
    } catch (error) {
        // NextJS redirects via throwing a specific error. 
        // We must re-throw it if it's not a sign-in error.

        if (error instanceof AuthError) {
            switch (error.type) {
                case "CredentialsSignin":
                    return { error: "Неверный логин или пароль!" };
                default:
                    return { error: "Что-то пошло не так!" };
            }
        }

        // IMPORTANT: Re-throw non-Auth errors (like redirects)
        throw error;
    }
};
