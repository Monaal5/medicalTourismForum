"use client";
import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Flag, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface ReportDialogProps {
    targetId: string;
    targetType: 'post' | 'question' | 'answer' | 'comment' | 'user';
    userId?: string; // Reporter ID
    trigger?: React.ReactNode;
    onOpenChange?: (open: boolean) => void;
}

export default function ReportDialog({ targetId, targetType, userId, trigger, onOpenChange }: ReportDialogProps) {
    const [open, setOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const reasons = [
        "Spam or misleading content",
        "Harassment or hate speech",
        "Inappropriate medical advice",
        "Violence or illegal content",
        "Other"
    ];

    const handleSubmit = async () => {
        if (!userId) {
            toast.error("You must be logged in to report content.");
            return;
        }
        if (!reason) {
            toast.error("Please select a reason.");
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch("/api/reports", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    targetId,
                    targetType,
                    reason,
                    userId
                }),
            });

            if (response.ok) {
                toast.success("Report submitted. Thank you for helping keep our community safe.");
                setOpen(false);
                if (onOpenChange) onOpenChange(false);
            } else {
                toast.error("Failed to submit report. Please try again.");
            }
        } catch (error) {
            console.error("Error reporting:", error);
            toast.error("An error occurred.");
        } finally {
            setSubmitting(false);
        }
    };

    const handleOpenChange = (newOpen: boolean) => {
        setOpen(newOpen);
        if (onOpenChange) onOpenChange(newOpen);
    };

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogTrigger asChild>
                {trigger || (
                    <button className="flex items-center space-x-2 text-gray-500 hover:text-red-600 transition-colors">
                        <Flag className="w-4 h-4" />
                        <span className="text-sm">Report</span>
                    </button>
                )}
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Report Content</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <p className="text-sm text-gray-500" id="report-description">
                        Why are you reporting this content? Your report will be anonymous to the author.
                    </p>
                    <div className="space-y-2" aria-describedby="report-description">
                        {reasons.map((r) => (
                            <div key={r} className="flex items-center space-x-2">
                                <input
                                    type="radio"
                                    id={r}
                                    value={r}
                                    checked={reason === r}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <Label htmlFor={r} className="font-normal cursor-pointer select-none">
                                    {r}
                                </Label>
                            </div>
                        ))}
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => setOpen(false)} disabled={submitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={submitting || !reason} variant="destructive">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Submit Report
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
