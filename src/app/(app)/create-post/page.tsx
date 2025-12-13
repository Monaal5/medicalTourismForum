import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { formatDistanceToNow } from "date-fns";
import { Plus, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface Category {
  _id: string;
  name: string;
  slug: {
    current: string;
  };
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
}

const categoriesQuery = defineQuery(`
  *[_type == "category"] | order(name asc) {
    _id,
    name,
    slug,
    description,
    icon,
    color,
    "questionCount": count(*[_type == "question" && references(^._id)])
  }
`);

export default async function CreatePostPage() {
  let categories: Category[] = [];
  let loading = false;

  try {
    const result = await sanityFetch({
      query: categoriesQuery,
      params: {},
    });

    if (result.data) {
      categories = result.data as Category[];
    }
  } catch (error) {
    console.error("Error fetching subreddits:", error);
    loading = true;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 rounded w-1/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-32 bg-gray-300 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

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
          {categories.map((category) => (
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
                  {/* Simple icon fallback or use lucide based on string name - simplifying for now */}
                  <span className="text-lg font-bold">{category.name.charAt(0)}</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {category.name}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {category.questionCount || 0} questions
                  </p>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                {category.description}
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
