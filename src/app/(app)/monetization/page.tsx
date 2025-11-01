"use client";
import ComingSoon from "@/components/ComingSoon";
import { DollarSign } from "lucide-react";

export default function MonetizationPage() {
  return (
    <ComingSoon
      icon={DollarSign}
      title="Monetization"
      description="Earn money by sharing your medical expertise and content"
      features={[
        "Monetize your medical knowledge and answers",
        "Earn from premium content subscriptions",
        "Get paid for consulting services",
        "Revenue sharing from popular content",
        "Flexible payout options and schedules",
        "Transparent earnings dashboard",
        "Tax documentation and support",
      ]}
      requireAuth={true}
    />
  );
}
