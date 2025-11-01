"use client";
import ComingSoon from "@/components/ComingSoon";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  return (
    <ComingSoon
      icon={Bookmark}
      title="Bookmarks"
      description="Save and organize your favorite posts and answers"
      features={[
        "Save posts and answers for later reading",
        "Organize bookmarks into custom collections",
        "Quick access to your saved content",
        "Search through your bookmarks",
        "Share bookmark collections with others",
        "Export bookmarks for offline access",
      ]}
      requireAuth={true}
    />
  );
}
