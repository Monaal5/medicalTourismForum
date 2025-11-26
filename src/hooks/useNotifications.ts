"use client";
import { useState, useEffect, useCallback } from "react";

interface Notification {
    _id: string;
    type: string;
    read: boolean;
    createdAt: string;
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

interface UseNotificationsOptions {
    userId: string | null;
    pollingInterval?: number; // in milliseconds
    onNewNotification?: (notification: Notification) => void;
}

export function useNotifications({
    userId,
    pollingInterval = 30000, // 30 seconds default
    onNewNotification,
}: UseNotificationsOptions) {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/notifications?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                const newNotifications = data.notifications;

                // Check for new notifications
                if (notifications.length > 0) {
                    const newNotifs = newNotifications.filter(
                        (n: Notification) => !notifications.find(existing => existing._id === n._id)
                    );

                    // Trigger callback for each new notification
                    newNotifs.forEach((notif: Notification) => {
                        if (onNewNotification && !notif.read) {
                            onNewNotification(notif);
                        }
                    });
                }

                setNotifications(newNotifications);
            }
        } catch (error) {
            console.error("Error fetching notifications:", error);
        }
    }, [userId, notifications, onNewNotification]);

    const fetchUnreadCount = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await fetch(`/api/notifications/unread-count?userId=${userId}`);
            const data = await response.json();

            if (data.success) {
                setUnreadCount(data.count);
            }
        } catch (error) {
            console.error("Error fetching unread count:", error);
        }
    }, [userId]);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;

        try {
            const response = await fetch('/api/notifications/mark-all-read', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (data.success) {
                setUnreadCount(0);
                setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            }
        } catch (error) {
            console.error("Error marking notifications as read:", error);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId: string) => {
        try {
            const response = await fetch('/api/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ notificationId }),
            });

            const data = await response.json();

            if (data.success) {
                setNotifications(prev =>
                    prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
                );
                setUnreadCount(prev => Math.max(0, prev - 1));
            }
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }, []);

    // Initial fetch
    useEffect(() => {
        if (userId) {
            setLoading(true);
            Promise.all([fetchNotifications(), fetchUnreadCount()])
                .finally(() => setLoading(false));
        }
    }, [userId]); // Only run on userId change

    // Polling for new notifications
    useEffect(() => {
        if (!userId || pollingInterval <= 0) return;

        const interval = setInterval(() => {
            fetchNotifications();
            fetchUnreadCount();
        }, pollingInterval);

        return () => clearInterval(interval);
    }, [userId, pollingInterval, fetchNotifications, fetchUnreadCount]);

    return {
        notifications,
        unreadCount,
        loading,
        fetchNotifications,
        fetchUnreadCount,
        markAllAsRead,
        markAsRead,
    };
}
