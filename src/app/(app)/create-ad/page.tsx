"use client";
import ComingSoon from "@/components/ComingSoon";
import { Megaphone } from "lucide-react";

export default function CreateAdPage() {
  return (
    <ComingSoon
      icon={Megaphone}
      title="Create Advertisement"
      description="Promote your medical services and reach a wider audience"
      features={[
        "Create targeted ads for medical services",
        "Reach healthcare professionals and patients",
        "Track ad performance with detailed analytics",
        "Flexible pricing and ad placement options",
        "A/B testing for better conversion rates",
        "Compliance with healthcare advertising regulations",
      ]}
      requireAuth={true}
    />
  );
}
