"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";
import { addDays, format, parseISO, startOfDay, endOfDay, isSameDay, getDay } from "date-fns";

export const createSchedule = async (values: any) => {
    try {
        const { dayOfWeek, startTime, endTime, subjectId, teacherId, groupId, location, latitude, longitude, radius } = values;

        await db.schedule.create({
            data: {
                dayOfWeek: parseInt(dayOfWeek),
                startTime,
                endTime,
                subjectId,
                teacherId,
                groupId,
                location,
                latitude: latitude ? parseFloat(latitude.toString()) : null,
                longitude: longitude ? parseFloat(longitude.toString()) : null,
                radius: radius ? parseFloat(radius.toString()) : 50
            }
        });

        revalidatePath("/admin/schedules");
        return { success: "Расписание успешно создано" };
    } catch (error: any) {
        console.error("Schedule creation error:", error);
        return { error: `Ошибка при создании расписания: ${error.message}` };
    }
};

export const deleteSchedule = async (id: string) => {
    try {
        await db.schedule.delete({ where: { id } });
        revalidatePath("/admin/schedules");
        return { success: "Расписание удалено" };
    } catch {
        return { error: "Ошибка при удалении расписания" };
    }
};

export const generateLessonsFromSchedules = async (startDate: string, endDate: string) => {
    try {
        const start = startOfDay(parseISO(startDate));
        const end = endOfDay(parseISO(endDate));

        const schedules = await db.schedule.findMany({
            include: { subject: true, teacher: true, group: true }
        });

        let generatedCount = 0;
        let skippedCount = 0;

        let current = start;
        while (current <= end) {
            const dayOfWeek = getDay(current); // 0-6 (Sun-Sat)
            const activeSchedules = schedules.filter(s => s.dayOfWeek === dayOfWeek);

            for (const sch of activeSchedules) {
                // Construct Date objects for start and end times
                const [startH, startM] = sch.startTime.split(':').map(Number);
                const [endH, endM] = sch.endTime.split(':').map(Number);

                const lessonStart = new Date(current);
                lessonStart.setHours(startH, startM, 0, 0);

                const lessonEnd = new Date(current);
                lessonEnd.setHours(endH, endM, 0, 0);

                // Check if lesson already exists for this subject, group, and time
                const existing = await db.lesson.findFirst({
                    where: {
                        subjectId: sch.subjectId,
                        groupId: sch.groupId,
                        startTime: lessonStart
                    }
                });

                if (!existing) {
                    await db.lesson.create({
                        data: {
                            startTime: lessonStart,
                            endTime: lessonEnd,
                            subjectId: sch.subjectId,
                            teacherId: sch.teacherId,
                            groupId: sch.groupId,
                            requiresLocation: !!sch.latitude,
                            latitude: sch.latitude,
                            longitude: sch.longitude,
                            radius: sch.radius,
                            isActive: true
                        }
                    });
                    generatedCount++;
                } else {
                    skippedCount++;
                }
            }
            current = addDays(current, 1);
        }

        revalidatePath("/teacher");
        revalidatePath("/admin");
        return { success: `Сгенерировано занятий: ${generatedCount}. Пропущено (уже существуют): ${skippedCount}` };
    } catch (error: any) {
        return { error: `Ошибка при генерации: ${error.message}` };
    }
};
