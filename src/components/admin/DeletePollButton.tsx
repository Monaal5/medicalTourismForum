"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

interface DeletePollButtonProps {
    pollId: string;
}

export default function DeletePollButton({ pollId }: DeletePollButtonProps) {
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this poll? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        const toastId = toast.loading("Deleting poll...");

        try {
            const response = await fetch(`/api/polls/${pollId}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Poll deleted successfully", { id: toastId });
                router.refresh();
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to delete poll", { id: toastId });
            }
        } catch (error) {
            console.error("Error deleting poll:", error);
            toast.error("An error occurred", { id: toastId });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
        >
            {isDeleting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
                <Trash2 className="w-4 h-4" />
            )}
        </Button>
    );
}
