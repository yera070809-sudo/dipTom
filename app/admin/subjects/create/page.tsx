import { CreateSubjectForm } from "@/components/admin/create-subject-form";

export default function CreateSubjectPage() {
    return (
        <div className="max-w-md mx-auto">
            <h1 className="text-2xl font-bold mb-6">Create New Subject</h1>
            <CreateSubjectForm />
        </div>
    );
}
