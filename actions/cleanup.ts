"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export async function checkAndCloseExpiredLessons() {
    try {
        const now = new Date();

        // Update all lessons that are active BUT have an endTime in the past
        const result = await db.lesson.updateMany({
            where: {
                isActive: true,
                endTime: {
                    lt: now
                }
            },
            data: {
                isActive: false
            }
        });

        if (result.count > 0) {
            console.log(`[Cleanup] Closed ${result.count} expired lessons.`);
        }

        return { count: result.count };
    } catch (error) {
        console.error("[Cleanup] Error checking expired lessons:", error);
        return { count: 0 };
    }
}
