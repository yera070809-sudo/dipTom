"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const rotateLessonToken = async (lessonId: string) => {
    const session = await auth();
    if (session?.user?.role !== "TEACHER") {
        return { error: "Недостаточно прав" };
    }

    const lesson = await db.lesson.findUnique({
        where: { id: lessonId }
    });

    if (!lesson || lesson.teacherId !== session.user.id) {
        return { error: "Занятие не найдено или у вас нет прав" };
    }

    const newToken = Math.random().toString(36).substring(7);

    await db.lesson.update({
        where: { id: lessonId },
        data: {
            token: newToken,
            previousToken: lesson.token
        }
    });

    revalidatePath(`/teacher/lessons/${lessonId}`);
    return { success: true, token: newToken };
};
