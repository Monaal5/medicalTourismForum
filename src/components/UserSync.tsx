"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";

export default function UserSync() {
    const { user, isSignedIn } = useUser();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!isSignedIn || !user || syncedRef.current) return;

        const syncUser = async () => {
            try {
                const response = await fetch("/api/sync-user", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        userFullName: user.fullName || user.firstName || "User",
                        userEmail: user.primaryEmailAddress?.emailAddress,
                        userImageUrl: user.imageUrl,
                    }),
                });

                if (response.ok) {
                    syncedRef.current = true;
                    console.log("User synced successfully");
                } else {
                    console.error("Failed to sync user");
                }
            } catch (error) {
                console.error("Error syncing user:", error);
            }
        };

        syncUser();
    }, [isSignedIn, user]);

    return null;
}
