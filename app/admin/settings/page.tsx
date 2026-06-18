import { db } from "@/lib/db";
import { SettingsForm } from "@/components/admin/settings-form";

export default async function SettingsPage() {
    const rawSettings = await db.systemSetting.findMany();
    const settings: Record<string, string> = {};
    rawSettings.forEach(s => {
        settings[s.key] = s.value;
    });

    return (
        <div className="p-2">
            <SettingsForm initialSettings={settings} />
        </div>
    );
}
