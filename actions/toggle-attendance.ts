"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const toggleAttendance = async (
    lessonId: string,
    studentId: string,
    isManual: boolean = true
) => {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "TEACHER") {
            return { error: "Недостаточно прав" };
        }

        const lesson = await db.lesson.findUnique({
            where: { id: lessonId }
        });

        if (!lesson || lesson.teacherId !== session.user.id) {
            return { error: "Занятие не найдено или у вас нет прав" };
        }

        const existing = await db.attendance.findUnique({
            where: {
                lessonId_studentId: {
                    studentId: session.user.id,
                    lessonId: lessonId
                }
            }
        });

        if (existing) {
            // Unmark
            await db.attendance.delete({
                where: { id: existing.id }
            });
            revalidatePath(`/teacher/lessons/${lessonId}`);
            return { success: "Отметка удалена" };
        } else {
            // Mark
            await db.attendance.create({
                data: {
                    studentId,
                    lessonId,
                    status: "PRESENT",
                    scannedAt: new Date() // For manual we still set a time
                }
            });
            revalidatePath(`/teacher/lessons/${lessonId}`);
            return { success: "Студент отмечен" };
        }
    } catch (e) {
        console.error("TOGGLE ATTENDANCE ERROR:", e);
        return { error: "Произошла ошибка при изменении статуса" };
    }
};
