"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/actions/admin-events.actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function CreateEventForm() {
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        const formData = new FormData(e.currentTarget);

        try {
            await createEvent(formData);
            router.push("/admin/events");
        } catch (err: any) {
            setError(err.message || "Failed to create event");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 bg-white p-6 rounded-lg shadow max-w-lg">
            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="space-y-2">
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title (Optional)</label>
                <Input name="title" id="title" placeholder="Promo 2024" />
            </div>

            <div className="space-y-2">
                <label htmlFor="linkUrl" className="block text-sm font-medium text-gray-700">Link URL (Optional)</label>
                <Input name="linkUrl" id="linkUrl" placeholder="https://..." />
            </div>

            <div className="space-y-2">
                <label htmlFor="image" className="block text-sm font-medium text-gray-700">Image (Required)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                    <Input type="file" name="image" id="image" accept="image/*" required className="cursor-pointer" />
                </div>
            </div>

            <div className="pt-4">
                <Button type="submit" disabled={loading} className="w-full">
                    {loading ? "Creating..." : "Create Event"}
                </Button>
            </div>
        </form>
    );
}
