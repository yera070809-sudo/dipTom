"use server";

import { auth } from "@/auth";
import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { headers } from "next/headers";

interface LocationData {
    lat?: number;
    lng?: number;
}

import { getDistance } from "@/lib/utils";
import { DEFAULT_ATTENDANCE_RADIUS } from "@/lib/constants";

export const markAttendance = async (
    decodedText: string,
    location: LocationData
) => {
    try {
        const session = await auth();
        if (!session?.user?.id || session.user.role !== "STUDENT") {
            return { error: "Необходима авторизация студента" };
        }

        let data;
        try {
            data = JSON.parse(decodedText);
        } catch (e) {
            return { error: "Неверный формат QR-кода" };
        }

        const { l: lessonId, t: token } = data;

        if (!lessonId || !token) return { error: "Неверный QR-код" };

        const lesson = await db.lesson.findUnique({
            where: { id: lessonId },
            include: { subject: true }
        });

        if (!lesson) return { error: "Занятие не найдено" };

        // Token check with grace period
        if (lesson.token !== token && lesson.previousToken !== token) {
            return { error: "Срок действия кода истек. Сканируйте новый код." };
        }

        // Check if already marked
        const existing = await db.attendance.findUnique({
            where: {
                lessonId_studentId: {
                    studentId: session.user.id,
                    lessonId: lessonId
                }
            }
        });

        if (existing) return { error: "Вы уже отметились на этом занятии" };

        // Location check
        if (lesson.requiresLocation) {
            if (!location.lat || !location.lng) {
                return { error: "Для этого занятия требуется доступ к геолокации" };
            }

            if (!lesson.latitude || !lesson.longitude) {
                // Critical check: if teacher enabled location but didn't pin it, fail gracefully
                return { error: "Ошибка настройки занятия: Преподаватель не указал координаты аудитории." };
            }

            const dist = getDistance(
                location.lat,
                location.lng,
                lesson.latitude,
                lesson.longitude
            );

            // Using lesson.radius or fallback to global setting, default to constant
            const settingRadius = await db.systemSetting.findUnique({ where: { key: "default_radius" } });
            const allowedRadius = (lesson as any).radius || parseInt(settingRadius?.value || DEFAULT_ATTENDANCE_RADIUS.toString());

            if (dist > allowedRadius) {
                return { error: `Вы находитесь слишком далеко (${Math.round(dist)}м). Подойдите ближе к аудитории.` };
            }
        }

        const headerList = await headers();
        const ip = headerList.get("x-forwarded-for") || "unknown";
        const ua = headerList.get("user-agent") || "unknown";

        await db.attendance.create({
            data: {
                studentId: session.user.id,
                lessonId: lessonId,
                status: "PRESENT",
                ipAddress: ip,
                userAgent: ua,
            }
        });

        revalidatePath("/student");
        revalidatePath(`/teacher/lessons/${lessonId}`);

        return { success: `Присутствие на "${lesson.subject.name}" успешно отмечено!` };
    } catch (e) {
        console.error("MARK ATTENDANCE ERROR:", e);
        return { error: "Произошла внутренняя ошибка при отметке присутствия" };
    }
};
