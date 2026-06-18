"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const CreateGroupSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
});

export const createGroup = async (values: z.infer<typeof CreateGroupSchema>) => {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Недостаточно прав" };

    const validated = CreateGroupSchema.safeParse(values);
    if (!validated.success) return { error: "Некорректные данные" };

    const { name } = validated.data;

    const existing = await db.group.findUnique({ where: { name } });
    if (existing) return { error: "Группа с таким названием уже существует" };

    await db.group.create({
        data: { name }
    });

    revalidatePath("/admin/groups");
    redirect("/admin/groups");
};
