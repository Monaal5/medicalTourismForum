
"use client";

import { useUser } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { useRouter, usePathname } from "next/navigation";

export default function UserSync() {
    const { user, isSignedIn } = useUser();
    const router = useRouter();
    const pathname = usePathname();
    const syncedRef = useRef(false);

    useEffect(() => {
        if (!isSignedIn || !user || syncedRef.current) return;

        // Don't sync if already on onboarding page to avoid loops
        if (pathname?.startsWith('/onboarding')) return;

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

                const data = await response.json();

                if (response.ok) {
                    syncedRef.current = true;
                    if (data.action === "onboarding_required") {
                        console.log("Redirecting to onboarding...");
                        router.push("/onboarding");
                    } else {
                        console.log("User synced successfully");
                    }
                } else {
                    console.error("Failed to sync user");
                }
            } catch (error) {
                console.error("Error syncing user:", error);
            }
        };

        syncUser();
    }, [isSignedIn, user, router, pathname]);

    return null;
}
