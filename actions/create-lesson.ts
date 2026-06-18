"use server";

import * as z from "zod";
import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const CreateLessonSchema = z.object({
    subjectId: z.string().min(1, "Предмет обязателен"),
    groupId: z.string().min(1, "Группа обязательна"),
    startTime: z.string().min(1, "Время начала обязательно"), // datetime-local string
    endTime: z.string().min(1, "Время окончания обязательно"),   // datetime-local string
    requiresLocation: z.boolean().default(false),
    latitude: z.number().optional(),
    longitude: z.number().optional(),
});

export const createLesson = async (values: z.infer<typeof CreateLessonSchema>) => {
    const session = await auth();

    if (!session?.user?.id || session.user.role !== "TEACHER") {
        return { error: "Недостаточно прав" };
    }

    const validated = CreateLessonSchema.safeParse(values);
    if (!validated.success) {
        return { error: "Некорректные данные" };
    }

    const { subjectId, groupId, startTime, endTime, requiresLocation, latitude, longitude } = validated.data;

    // Generate a random initial token
    const token = Math.random().toString(36).substring(7);

    const settingRadius = await db.systemSetting.findUnique({ where: { key: "default_radius" } });
    const radius = parseInt(settingRadius?.value || "50");

    const lesson = await db.lesson.create({
        data: {
            title: "New Lesson", // Could be dynamic
            subjectId,
            groupId,
            teacherId: session.user.id,
            startTime: new Date(startTime),
            endTime: new Date(endTime),
            token,
            isActive: true,
            requiresLocation: requiresLocation || false,
            latitude,
            longitude,
            radius,
        },
    });

    revalidatePath("/teacher");
    revalidatePath("/student");
    redirect(`/teacher/lessons/${lesson.id}`);
};
