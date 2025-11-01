
"use client";

import ComingSoon from "@/components/ComingSoon";
import { Languages } from "lucide-react";

export default function LanguagesPage() {
  return (
    <ComingSoon
      icon={Languages} // ✅ Pass the component, NOT <Languages />
      title="Language Settings"
      description="Choose your preferred language for the platform"
      features={[
        "Multiple language support for global accessibility",
        "Automatic translation of content",
        "Region-specific content recommendations",
        "Community in your native language",
        "Multi-language search capabilities",
        "Cultural context preservation in translations",
      ]}
      requireAuth={false} // Optional, allows access without login
    />
  );
}
