"use client";
import { Bell, X } from "lucide-react";
import { useRouter } from "next/navigation";

interface Notification {
    _id: string;
    type: string;
    sender?: {
        username: string;
        imageUrl?: string;
    };
    question?: {
        _id: string;
        title: string;
        slug: string;
    };
}

interface NotificationToastProps {
    notification: Notification;
    onClose: () => void;
}

export function NotificationToast({ notification, onClose }: NotificationToastProps) {
    const router = useRouter();

    const getNotificationMessage = () => {
        const username = notification.sender?.username || "Someone";

        switch (notification.type) {
            case "follow":
                return `${username} started following you`;
            case "answer":
                return `${username} answered your question`;
            case "comment":
                return `${username} commented on your post`;
            case "upvote":
                return `${username} upvoted your content`;
            default:
                return "New notification";
        }
    };

    const handleClick = () => {
        // Navigate to the relevant page
        if (notification.question?.slug) {
            router.push(`/question/${notification.question.slug}`);
        } else {
            router.push("/notifications");
        }
        onClose();
    };

    return (
        <div
            className="fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-600 animate-slide-in cursor-pointer hover:shadow-xl transition-shadow z-50 max-w-sm"
            onClick={handleClick}
        >
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">New Notification</p>
                    <p className="text-sm text-gray-600 mt-1">{getNotificationMessage()}</p>
                    {notification.question?.title && (
                        <p className="text-xs text-gray-500 mt-1 truncate">
                            {notification.question.title}
                        </p>
                    )}
                </div>
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onClose();
                    }}
                    className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
