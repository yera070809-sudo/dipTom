"use server";

import { db } from "@/lib/db";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export const bulkImportUsers = async (users: any[]) => {
    try {
        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        for (const data of users) {
            try {
                const { email, name, password, role, groupName } = data;

                if (!email || !password || !role) {
                    results.failed++;
                    results.errors.push(`Пропущены обязательные поля для ${email || 'неизвестного пользователя'}`);
                    continue;
                }

                const existing = await db.user.findUnique({ where: { email } });
                if (existing) {
                    results.failed++;
                    results.errors.push(`Пользователь ${email} уже существует`);
                    continue;
                }

                let groupId = null;
                if (groupName && role === "STUDENT") {
                    const group = await db.group.findUnique({ where: { name: groupName } });
                    if (group) {
                        groupId = group.id;
                    } else {
                        // Create group if doesn't exist? For now just log error or create.
                        // Let's create it for convenience.
                        const newGroup = await db.group.create({ data: { name: groupName } });
                        groupId = newGroup.id;
                    }
                }

                const hashedPassword = await bcrypt.hash(password, 10);
                await db.user.create({
                    data: {
                        email,
                        name,
                        password: hashedPassword,
                        role,
                        groupId
                    }
                });
                results.success++;
            } catch (err: any) {
                results.failed++;
                results.errors.push(`Ошибка при создании ${data.email}: ${err.message}`);
            }
        }

        revalidatePath("/admin/users");
        return { success: `Успешно импортировано: ${results.success}. Ошибок: ${results.failed}`, errors: results.errors };
    } catch (error: any) {
        return { error: "Критическая ошибка при импорте" };
    }
};

export const bulkImportSubjects = async (subjects: any[]) => {
    try {
        const results = { success: 0, failed: 0 };
        for (const data of subjects) {
            try {
                const { name, code } = data;
                if (!name || !code) continue;

                await db.subject.upsert({
                    where: { code },
                    update: { name },
                    create: { name, code }
                });
                results.success++;
            } catch {
                results.failed++;
            }
        }
        revalidatePath("/admin/subjects");
        return { success: `Импортировано предметов: ${results.success}` };
    } catch {
        return { error: "Ошибка при импорте предметов" };
    }
};
