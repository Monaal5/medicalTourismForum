"use client";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { generateUsername } from "@/lib/username";

export default function ProfileRedirectPage() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const [sanityUsername, setSanityUsername] = useState<string | null>(null);

  // Fetch username from Sanity to match what's used in posts/questions
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setSanityUsername(data.username);
          }
        })
        .catch((error) => {
          console.error("Error fetching user from Sanity:", error);
        });
    }
  }, [user?.id]);

  // Get username - use Sanity username if available, otherwise generate
  const getUsername = () => {
    if (!user) return "user";

    // Use Sanity username if we have it (this matches posts/questions)
    if (sanityUsername) return sanityUsername;

    // Fallback to generated username while loading
    return (
      user.username ||
      generateUsername(user.fullName || user.firstName || "User", user.id)
    );
  };

  useEffect(() => {
    if (isLoaded) {
      if (!user) {
        // Not logged in, redirect to sign in
        router.push("/sign-in");
      } else if (sanityUsername || user.username) {
        // Redirect to user's public profile page only when we have the username
        router.push(`/profile/${getUsername()}`);
      }
    }
  }, [user, isLoaded, sanityUsername, router]);

  // Show loading while checking auth status
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <h1 className="text-lg font-medium text-gray-900 mb-2">
          Loading Profile
        </h1>
        <p className="text-gray-600">Redirecting to your profile...</p>
      </div>
    </div>
  );
}
