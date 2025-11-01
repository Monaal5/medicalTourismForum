"use client";

import ComingSoon from "@/components/ComingSoon";
import { FileText } from "lucide-react";

export default function DraftsPage() {
  return (
    <ComingSoon
      icon={FileText}
      title="Drafts"
      description="Access and manage your unpublished content"
      features={[
        "Save posts and answers as drafts",
        "Auto-save to prevent losing your work",
        "Resume writing from where you left off",
        "Organize drafts by topic or category",
        "Set reminders to complete drafts",
        "Preview drafts before publishing",
      ]}
      requireAuth={true}
    />
  );
}
