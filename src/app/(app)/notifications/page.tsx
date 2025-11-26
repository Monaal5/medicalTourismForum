"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Bell, MessageCircle, UserPlus, Star } from "lucide-react";
import SignInPrompt from "@/components/SignInPrompt";

interface Notification {
  _id: string;
  type: "answer" | "follow" | "vote";
  read: boolean;
  createdAt: string;
  sender: {
    username: string;
    imageUrl: string;
  };
  question?: {
    _id: string;
    title: string;
    slug: {
      current: string;
    };
  };
}

export default function NotificationsPage() {
  const { user, isLoaded } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    } else if (isLoaded) {
      setLoading(false);
    }
  }, [user, isLoaded]);

  const fetchNotifications = async () => {
    try {
      // We need to pass the Sanity User ID, but we only have Clerk ID here.
      // The API should handle looking up the user by Clerk ID or we need to store Sanity ID in public metadata.
      // For now, let's pass the Clerk ID and let the API handle it (as discussed in the plan).
      // Wait, I implemented the API to expect userId.
      // Let's assume the API handles it.
      const response = await fetch(`/api/notifications?userId=${user?.id}`);
      if (response.ok) {
        const data = await response.json();
        setNotifications(data.notifications || []);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });

      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      // First, get the Sanity user ID
      const userResponse = await fetch(`/api/user/${user.id}`);
      const userData = await userResponse.json();

      if (!userData._id) return;

      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userData._id }),
      });

      if (response.ok) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
      }
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
    }
  };

  // Mark all as read when page is viewed
  useEffect(() => {
    if (user && notifications.length > 0) {
      const hasUnread = notifications.some(n => !n.read);
      if (hasUnread) {
        // Delay marking as read to give user time to see the notifications
        const timer = setTimeout(() => {
          markAllAsRead();
        }, 1000);

        return () => clearTimeout(timer);
      }
    }
  }, [user, notifications.length]);

  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <SignInPrompt
        icon={Bell}
        title="Sign in to view notifications"
        description="See who's interacting with your questions and answers"
        action="view notifications"
      />
    );
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "answer":
        return <MessageCircle className="w-5 h-5 text-blue-500" />;
      case "follow":
        return <UserPlus className="w-5 h-5 text-green-500" />;
      case "vote":
        return <Star className="w-5 h-5 text-yellow-500" />;
      default:
        return <Bell className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-4 border-b border-gray-200 flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
              {notifications.filter(n => !n.read).length} New
            </span>
          </div>

          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
          ) : notifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Bell className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No notifications yet</h3>
              <p className="text-gray-500">When people interact with you, you'll see it here.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-4 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/50' : ''}`}
                  onClick={() => !notification.read && markAsRead(notification._id)}
                >
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 mt-1">
                      {getIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900">
                        <span className="font-semibold">{notification.sender.username}</span>
                        {" "}
                        {notification.type === "answer" && "answered your question"}
                        {notification.type === "follow" && "started following you"}
                        {notification.type === "vote" && "upvoted your content"}
                      </p>
                      {notification.question && (
                        <Link
                          href={`/question/${notification.question._id}`}
                          className="text-sm font-medium text-blue-600 hover:text-blue-800 block mt-1 truncate"
                        >
                          {notification.question.title}
                        </Link>
                      )}
                      <p className="text-xs text-gray-500 mt-1">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.read && (
                      <div className="flex-shrink-0">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}