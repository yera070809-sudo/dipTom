"use server";

import { db } from "@/lib/db";
import { revalidatePath } from "next/cache";

export const getSetting = async (key: string, defaultValue: string) => {
    const setting = await db.systemSetting.findUnique({ where: { key } });
    return setting?.value ?? defaultValue;
};

export const updateSettings = async (settings: Record<string, string>) => {
    try {
        const operations = Object.entries(settings).map(([key, value]) =>
            db.systemSetting.upsert({
                where: { key },
                update: { value },
                create: { key, value }
            })
        );

        await db.$transaction(operations);
        revalidatePath("/admin/settings");
        return { success: "Настройки успешно сохранены" };
    } catch (error) {
        return { error: "Ошибка при сохранении настроек" };
    }
};
