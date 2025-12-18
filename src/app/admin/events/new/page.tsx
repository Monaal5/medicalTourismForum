import CreateEventForm from "@/components/admin/CreateEventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NewEventPage() {
    return (
        <div className="space-y-6">
            <div className="flex items-center space-x-2">
                <Link href="/admin/events" className="text-gray-500 hover:text-gray-900">
                    <ArrowLeft className="w-5 h-5" />
                </Link>
                <h1 className="text-2xl font-bold">New Event</h1>
            </div>

            <CreateEventForm />
        </div>
    );
}
