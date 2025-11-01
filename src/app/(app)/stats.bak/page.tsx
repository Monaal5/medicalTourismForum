"use client";
import ComingSoon from "@/components/ComingSoon";
import { BarChart3 } from "lucide-react";

export default function StatsPage() {
  return (
    <ComingSoon
      icon={BarChart3}
      title="Your Content & Stats"
      description="Track your contributions and engagement on the platform"
      features={[
        "View detailed analytics of your posts and answers",
        "Track views, upvotes, and engagement metrics",
        "See your most popular content",
        "Monitor follower growth over time",
        "Export data for further analysis",
        "Compare your performance with community averages",
      ]}
      requireAuth={true}
    />
  );
}
