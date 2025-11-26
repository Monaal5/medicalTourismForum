import { adminClient } from "@/sanity/lib/adminClient";
import Link from "next/link";
import { TrendingUp } from "lucide-react";

export default async function TrendingTopics() {
    // Fetch categories with most questions in the last 7 days
    // Or just categories with most questions overall for now
    const query = `
    *[_type == "category"] | order(count(*[_type == "question" && references(^._id)]) desc) [0...5] {
      _id,
      name,
      "slug": slug.current,
      "count": count(*[_type == "question" && references(^._id)])
    }
  `;

    const trendingCategories = await adminClient.fetch(query);

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mt-6">
            <div className="flex items-center space-x-2 mb-4">
                <TrendingUp className="w-5 h-5 text-red-500" />
                <h2 className="font-bold text-gray-900">Trending Topics</h2>
            </div>
            <div className="space-y-3">
                {trendingCategories.map((category: any) => (
                    <Link
                        key={category._id}
                        href={`/categories/${category.slug}`}
                        className="block group"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-gray-700 group-hover:text-blue-600 font-medium">
                                {category.name}
                            </span>
                            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                {category.count} Qs
                            </span>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
