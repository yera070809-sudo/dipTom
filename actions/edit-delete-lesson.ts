"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const EditLessonSchema = z.object({
    id: z.string(),
    subjectId: z.string().min(1, "Предмет обязателен"),
    groupId: z.string().min(1, "Группа обязательна"),
    startTime: z.string().min(1, "Время начала обязательно"),
    endTime: z.string().min(1, "Время окончания обязательно"),
    requiresLocation: z.boolean(),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const editLesson = async (values: z.infer<typeof EditLessonSchema>) => {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "TEACHER") {
        return { error: "Недостаточно прав" };
    }

    const validated = EditLessonSchema.safeParse(values);
    if (!validated.success) {
        return { error: "Некорректные данные" };
    }

    const { id, subjectId, groupId, startTime, endTime, requiresLocation, latitude, longitude } = validated.data;

    const existing = await db.lesson.findUnique({
        where: { id }
    });

    if (!existing || existing.teacherId !== session.user.id) {
        return { error: "Занятие не найдено или у вас нет прав" };
    }

    await db.lesson.update({
        where: { id },
        data: {
            subjectId,
            groupId,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            requiresLocation,
            latitude,
            longitude,
        },
    });

    revalidatePath("/teacher");
    revalidatePath(`/teacher/lessons/${id}`);
    return { success: "Занятие обновлено" };
};

export const deleteLesson = async (id: string) => {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "TEACHER") {
        return { error: "Недостаточно прав" };
    }

    const existing = await db.lesson.findUnique({
        where: { id }
    });

    if (!existing || existing.teacherId !== session.user.id) {
        return { error: "Занятие не найдено или у вас нет прав" };
    }

    // Delete associated attendances first (Prisma handles this if cascading is set, 
    // but manually for safety in SQLite if not defined)
    await db.attendance.deleteMany({
        where: { lessonId: id }
    });

    await db.lesson.delete({
        where: { id }
    });

    revalidatePath("/teacher");
    redirect("/teacher");
};
