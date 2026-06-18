"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import bcrypt from "bcryptjs";

const UpdateUserSchema = z.object({
    userId: z.string(),
    name: z.string().min(1, "Имя обязательно"),
    email: z.string().email("Некорректный email"),
    role: z.enum(["ADMIN", "TEACHER", "STUDENT"]),
    groupId: z.string().optional().nullable(),
    password: z.string().optional(),
});

export async function adminUpdateUser(formData: FormData) {
    try {
        const session = await auth();
        if (session?.user?.role !== "ADMIN") {
            return { error: "Доступ запрещен" };
        }

        const rawData = {
            userId: formData.get("userId"),
            name: formData.get("name"),
            email: formData.get("email"),
            role: formData.get("role"),
            groupId: formData.get("groupId") || null,
            password: formData.get("password") || undefined,
        };

        const validatedFields = UpdateUserSchema.safeParse(rawData);

        if (!validatedFields.success) {
            return { error: (validatedFields as any).error.errors[0].message };
        }

        const { userId, name, email, role, groupId, password } = validatedFields.data;

        // If role is STUDENT, group is optional but usually expected.
        // If role is not STUDENT, group should be null (disconnect).

        const updateData: any = {
            name,
            email,
            role,
        };

        if (role === "STUDENT") {
            updateData.groupId = groupId || null;
        } else {
            updateData.groupId = null;
        }

        if (password && password.length > 0) {
            if (password.length < 6) {
                return { error: "Пароль должен быть не менее 6 символов" };
            }
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }

        await db.user.update({
            where: { id: userId },
            data: updateData,
        });

        revalidatePath("/admin/users");
        return { success: "Пользователь обновлен" };

    } catch (error) {
        console.error("Update User Error:", error);
        return { error: "Ошибка обновления пользователя" };
    }
}
