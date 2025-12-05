"use client";
import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Plus, Hash } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/hooks/useCategories";

interface CategoriesSidebarProps {
  className?: string;
}

export default function CategoriesSidebar({
  className = "",
}: CategoriesSidebarProps) {
  const { categories, loading, error, refetch } = useCategories();
  const [isExpanded, setIsExpanded] = useState(true);

  const getCategoryIcon = (iconName?: string) => {
    // Map category icons - you can expand this
    const iconMap: { [key: string]: React.ReactNode } = {
      general: <Hash className="w-4 h-4" />,
      medical: <Hash className="w-4 h-4" />,
      surgery: <Hash className="w-4 h-4" />,
      dental: <Hash className="w-4 h-4" />,
      cardiology: <Hash className="w-4 h-4" />,
      dermatology: <Hash className="w-4 h-4" />,
      orthopedic: <Hash className="w-4 h-4" />,
    };

    return iconMap[iconName || "general"] || <Hash className="w-4 h-4" />;
  };

  const getCategoryColor = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "text-blue-600 bg-blue-50 hover:bg-blue-100",
      green: "text-green-600 bg-green-50 hover:bg-green-100",
      red: "text-red-600 bg-red-50 hover:bg-red-100",
      purple: "text-purple-600 bg-purple-50 hover:bg-purple-100",
      orange: "text-orange-600 bg-orange-50 hover:bg-orange-100",
      pink: "text-pink-600 bg-pink-50 hover:bg-pink-100",
      gray: "text-gray-600 bg-gray-50 hover:bg-gray-100",
    };

    return colorMap[color || "gray"] || colorMap.gray;
  };

  if (loading) {
    return (
      <div
        className={`bg-card border border-border rounded-lg p-4 ${className}`}
      >
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-8 bg-gray-100 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={`bg-card border border-red-200 rounded-lg p-4 ${className}`}
      >
        <div className="text-center">
          <p className="text-red-600 text-sm mb-2">Failed to load categories</p>
          <Button
            variant="outline"
            size="sm"
            onClick={refetch}
            className="text-xs"
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`bg-card border border-border rounded-lg overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 transition-colors"
            suppressHydrationWarning
          >
            {isExpanded ? (
              <ChevronDown className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
            <h3 className="font-semibold text-sm">Categories</h3>
            <span className="text-xs text-gray-500">({categories.length})</span>
          </button>

          <Link href="/categories">
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="w-3 h-3" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Categories List */}
      {isExpanded && (
        <div className="max-h-96 overflow-y-auto">
          {categories.length === 0 ? (
            <div className="p-4 text-center">
              <Hash className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-sm text-gray-500 mb-3">
                Loading categories...
              </p>
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={refetch}
              >
                Refresh
              </Button>
            </div>
          ) : (
            <div className="py-2">
              {categories.map((category) => (
                <Link
                  key={category._id}
                  href={`/categories/${category.slug}`}
                  className={`flex items-center space-x-3 px-4 py-2 transition-colors ${getCategoryColor(category.color)}`}
                >
                  <div className="flex-shrink-0">
                    {getCategoryIcon(category.icon)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium truncate">
                        {category.name}
                      </h4>
                      {category.questionCount !== undefined && (
                        <span className="text-xs text-gray-500 ml-2">
                          {category.questionCount}
                        </span>
                      )}
                    </div>

                    {category.description && (
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {category.description}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer */}
      {isExpanded && categories.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <Link href="/categories">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-gray-600 hover:text-gray-900"
            >
              View All Categories
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
