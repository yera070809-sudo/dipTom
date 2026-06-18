import { db } from "@/lib/db";
import { CreateUserForm } from "@/components/admin/create-user-form";

export default async function CreateUserPage() {
    const groups = await db.group.findMany();

    return (
        <div className="max-w-xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New User</h1>
            <CreateUserForm groups={groups} />
        </div>
    );
}
