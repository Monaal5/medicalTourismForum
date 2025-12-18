
"use client";

import { nukeDatabase } from "@/actions/admin-dashboard.actions";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

export function DashboardControls() {
    const [loading, setLoading] = useState(false);

    const handleNuke = async () => {
        if (!confirm("CRITICAL WARNING: This will delete ALL data (posts, questions, users, votes). This action CANNOT be undone. Are you absolutely sure?")) {
            return;
        }

        // Double confirmation for safety
        if (!confirm("Are you REALLY sure? This will reset the entire database.")) {
            return;
        }

        setLoading(true);
        const toastId = toast.loading("Reseting database...");

        try {
            await nukeDatabase();
            toast.success("Database reset successfully", { id: toastId });
            window.location.reload();
        } catch (error: any) {
            console.error("Nuke failed:", error);
            toast.error("Failed to reset database: " + error.message, { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex space-x-2">
            <Button
                variant="destructive"
                onClick={handleNuke}
                disabled={loading}
                className="bg-red-600 hover:bg-red-700 text-white"
            >
                <Trash2 className="w-4 h-4 mr-2" />
                {loading ? "Deleting..." : "Reset Database (Nuke)"}
            </Button>
        </div>
    );
}
