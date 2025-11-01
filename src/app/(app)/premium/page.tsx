
"use client";

import ComingSoon from "@/components/ComingSoon";
import { Sparkles } from "lucide-react";

export default function PremiumPage() {
  return (
    <ComingSoon
      icon={Sparkles}
      title="Premium+"
      description="Unlock exclusive features and enhance your experience"
      features={[
        "Ad-free browsing experience",
        "Priority support from our team",
        "Advanced analytics and insights",
        "Custom profile themes and badges",
        "Early access to new features",
        "Unlimited bookmarks and collections",
        "Download answers for offline reading",
        "Exclusive premium community access",
      ]}
      requireAuth={false}
    />
  );
}
