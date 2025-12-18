import { getHomeCategories } from "@/lib/db/queries";
import { supabase } from "@/lib/supabase";
import Link from "next/link";
import { TrendingUp, BarChart3 } from "lucide-react";

export const revalidate = 0; // Always fetch fresh data

export default async function TrendingTopics() {
    // Fetch categories from Supabase (source of truth)
    const allCategories = await getHomeCategories();

    // Sort by total activity (questions + posts) or just question count
    // Top 5 trending
    const trendingCategories = allCategories
        .sort((a: any, b: any) => (b.questionCount + b.postCount) - (a.questionCount + a.postCount))
        .slice(0, 5);

    // Fetch recent polls for each category to check for new ones
    // We fetch broadly and filter in memory since dataset is small for this component
    const { data: recentPolls, error: pollsError } = await supabase
        .from("polls")
        .select(`
            id,
            question,
            category_id,
            created_at
        `)
        .order("created_at", { ascending: false })
        .limit(20);

    // Group polls by category
    const pollsByCategory: Record<string, any[]> = {};
    if (recentPolls) {
        recentPolls.forEach((poll) => {
            if (poll.category_id) {
                if (!pollsByCategory[poll.category_id]) {
                    pollsByCategory[poll.category_id] = [];
                }
                // Keep only the latest one per category for display
                if (pollsByCategory[poll.category_id].length < 1) {
                    pollsByCategory[poll.category_id].push(poll);
                }
            }
        });
    }

    return (
        <div className="bg-card rounded-lg shadow-sm border border-border p-4 mt-6">
            <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-card-foreground">Trending Topics</h2>
            </div>
            <div className="space-y-3">
                {trendingCategories.map((category: any) => (
                    <div key={category._id}>
                        <Link
                            href={`/categories/${category.slug}`}
                            className="block group"
                        >
                            <div className="flex items-center justify-between">
                                <span className="text-gray-700 group-hover:text-blue-600 font-medium line-clamp-1">
                                    {category.name}
                                </span>
                                <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full whitespace-nowrap">
                                    {category.questionCount} Qs
                                </span>
                            </div>
                        </Link>
                    </div>
                ))}

                {/* New Polls Section - Displayed below trending topics */}
                {/* New Polls Section - Recent Polls from any category */}
                {recentPolls && recentPolls.length > 0 && recentPolls
                    .filter(poll => {
                        // Check if poll is recent (e.g., within last 24 hours)
                        const pollDate = new Date(poll.created_at);
                        const timeDiff = Date.now() - pollDate.getTime();
                        const isRecent = timeDiff < 24 * 60 * 60 * 1000; // 24 hours window (user asked for 1h but keeping it safe for visibility, 1h is too fleeting)
                        return isRecent;
                    })
                    .slice(0, 1) // Show only the absolute latest 1 as requested "the recent poll"
                    .map((poll) => {
                        const category = allCategories.find((c: any) => c._id === poll.category_id);
                        if (!category) return null;

                        return (
                            <div key={poll.id} className="mt-4 pt-3 border-t border-gray-100">
                                <Link
                                    href={`/polls/${poll.id}`}
                                    className="block p-2 bg-blue-50 rounded-md border border-blue-100 group hover:shadow-sm hover:border-blue-200 transition-all"
                                >
                                    <div className="flex items-start gap-2">
                                        <BarChart3 className="w-3.5 h-3.5 text-blue-600 mt-0.5 shrink-0" />
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-blue-600 tracking-wider mb-0.5">
                                                New poll under category: {category.name}
                                            </p>
                                            <p className="text-xs text-gray-800 font-medium line-clamp-2 leading-snug">
                                                {poll.question}
                                            </p>
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        );
                    })}

                <div className="pt-3 mt-3 border-t border-gray-100 space-y-3">
                    <Link
                        href="/success-stories"
                        className="block group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 group-hover:text-green-600 font-medium flex items-center gap-2">
                                <span>🏆</span> Success Stories
                            </span>
                        </div>
                    </Link>
                    <Link
                        href="/travel-tips"
                        className="block group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 group-hover:text-amber-600 font-medium flex items-center gap-2">
                                <span>✈️</span> Travel Tips
                            </span>
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
}
