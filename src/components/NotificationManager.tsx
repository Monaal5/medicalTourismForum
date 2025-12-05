"use client";

import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { useNotifications } from "@/hooks/useNotifications";
import { toast } from "react-hot-toast";
import { NotificationToast } from "@/components/NotificationToast";

export default function NotificationManager() {
    const { user } = useUser();

    const { } = useNotifications({
        userId: user?.id || null,
        onNewNotification: (notification) => {
            toast.custom(
                (t) => (
                    <NotificationToast
                        notification={notification}
                        onClose={() => toast.dismiss(t.id)}
                    />
                ),
                {
                    duration: 5000,
                    position: "top-right",
                }
            );
        },
    });

    return null;
}
