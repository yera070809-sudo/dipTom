"use server";

import * as z from "zod";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

const CreateSubjectSchema = z.object({
    name: z.string().min(1, "Название обязательно"),
    code: z.string().min(1, "Код обязателен"),
});

export const createSubject = async (values: z.infer<typeof CreateSubjectSchema>) => {
    const session = await auth();
    if (session?.user?.role !== "ADMIN") return { error: "Недостаточно прав" };

    const validated = CreateSubjectSchema.safeParse(values);
    if (!validated.success) return { error: "Некорректные данные" };

    const { name, code } = validated.data;

    const existing = await db.subject.findUnique({ where: { code } });
    if (existing) return { error: "Предмет с таким кодом уже существует" };

    await db.subject.create({
        data: { name, code }
    });

    revalidatePath("/admin/subjects");
    redirect("/admin/subjects");
};
