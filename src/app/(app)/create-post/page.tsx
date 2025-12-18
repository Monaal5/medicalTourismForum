import { getHomeCategories } from "@/lib/db/queries";
import { Plus, Users, MessageSquare, FileText, BarChart3 } from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function CreatePostPage() {
  const categories = await getHomeCategories();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600">
            Choose a category to create your post in
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category: any) => (
            <Link
              key={category._id}
              href={`/new-post?category=${category._id}`}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center mb-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-white"
                  style={{ backgroundColor: category.color || "#ef4444" }}
                >
                  <span className="text-lg font-bold">{category.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 line-clamp-1">
                    {category.name}
                  </h3>
                  <div className="flex flex-wrap gap-3 text-xs text-gray-500 mt-1">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="w-3 h-3" /> {category.questionCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <FileText className="w-3 h-3" /> {category.postCount || 0}
                    </span>
                    <span className="flex items-center gap-1">
                      <BarChart3 className="w-3 h-3" /> {category.pollCount || 0}
                    </span>
                  </div>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2 min-h-[2.5em]">
                {category.description || "No description available."}
              </p>
              <div className="flex items-center text-blue-600 text-sm font-medium">
                <Plus className="w-4 h-4 mr-1" />
                <span>Create Post</span>
              </div>
            </Link>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories found
            </h3>
            <p className="text-gray-500 mb-4">
              There are no categories available.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
