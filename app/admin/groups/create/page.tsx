import { CreateGroupForm } from "@/components/admin/create-group-form";

export default function CreateGroupPage() {
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Group</h1>
            <CreateGroupForm />
        </div>
    );
}
