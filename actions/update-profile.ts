"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import bcrypt from "bcryptjs";

const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Имя не может быть пустым"),
    password: z.string().optional(),
    confirmPassword: z.string().optional(),
}).refine((data) => {
    if (data.password && data.password.length < 6) {
        return false;
    }
    return true;
}, {
    message: "Пароль должен содержать минимум 6 символов",
    path: ["password"]
}).refine((data) => {
    if (data.password && data.password !== data.confirmPassword) {
        return false;
    }
    return true;
}, {
    message: "Пароли не совпадают",
    path: ["confirmPassword"]
});

export async function updateProfile(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { error: "Необходима авторизация" };
        }

        const rawData = {
            name: formData.get("name"),
            password: formData.get("password") || undefined,
            confirmPassword: formData.get("confirmPassword") || undefined,
        };

        const validatedFields = UpdateProfileSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { error: validatedFields.error.errors[0].message };
        }

        const { name, password } = validatedFields.data;

        const updateData: any = { name };

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await db.user.update({
            where: { id: session.user.id },
            data: updateData,
        });

        revalidatePath("/student/profile");
        revalidatePath("/student"); // Update dashboard name if displayed there

        return { success: "Профиль успешно обновлен" };

    } catch (error) {
        console.error("Profile update error:", error);
        return { error: "Произошла ошибка при обновлении профиля" };
    }
}
