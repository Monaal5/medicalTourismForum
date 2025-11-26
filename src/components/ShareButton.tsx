"use client";

import { Share } from "lucide-react";
import toast from "react-hot-toast";

interface ShareButtonProps {
    title: string;
    text?: string;
    url: string;
    className?: string;
}

export default function ShareButton({
    title,
    text,
    url,
    className = "flex items-center space-x-1.5 hover:text-blue-600 transition-colors",
}: ShareButtonProps) {
    const handleShare = async () => {
        const shareData = {
            title,
            text,
            url: window.location.origin + url,
        };

        try {
            if (navigator.share) {
                await navigator.share(shareData);
            } else {
                await navigator.clipboard.writeText(shareData.url);
                toast.success("Link copied to clipboard!");
            }
        } catch (error) {
            console.error("Error sharing:", error);
        }
    };

    return (
        <button onClick={handleShare} className={className} suppressHydrationWarning>
            <Share className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-medium hidden sm:inline">Share</span>
        </button>
    );
}
