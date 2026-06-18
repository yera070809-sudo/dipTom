"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const CreateUserSchema = z.object({
    name: z.string().min(1, "Имя обязательно"),
    email: z.string().email("Некорректный email"),
    password: z.string().min(6, "Пароль минимум 6 символов"),
    role: z.string(),
    groupId: z.string().optional(),
});

export const createUser = async (values: z.infer<typeof CreateUserSchema>) => {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Недостаточно прав" };

    const validated = CreateUserSchema.safeParse(values);
    if (!validated.success) return { error: "Некорректные данные" };

    const { name, email, password, role, groupId } = validated.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return { error: "Email уже зарегистрирован" };

    const hashedPassword = await bcrypt.hash(password, 10);

    await db.user.create({
        data: {
            name,
            email,
            password: hashedPassword, // In real app, might want to force reset
            role,
            groupId: role === "STUDENT" && groupId ? groupId : undefined,
        }
    });

    revalidatePath("/admin/users");
    redirect("/admin/users");
};
