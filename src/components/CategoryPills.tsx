"use client";
import { useState } from "react";

interface CategoryPillsProps {
    categories: Array<{
        _id: string;
        name: string;
        slug: string;
        color?: string;
    }>;
    onCategoryChange?: (categoryId: string | null) => void;
}

export default function CategoryPills({ categories, onCategoryChange }: CategoryPillsProps) {
    const [activeCategory, setActiveCategory] = useState<string | null>(null);

    const handleCategoryClick = (categoryId: string | null) => {
        setActiveCategory(categoryId);
        onCategoryChange?.(categoryId);
    };

    return (
        <div className="sticky top-14 z-40 bg-background/95 backdrop-blur-sm border-b border-border py-3 -mx-4 px-4 sm:-mx-6 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide pb-1">
                {/* All Category */}
                <button
                    onClick={() => handleCategoryClick(null)}
                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === null
                        ? "bg-blue-600 text-white shadow-md"
                        : "bg-muted text-muted-foreground hover:bg-muted/80"
                        }`}
                >
                    All
                </button>

                {/* Category Pills */}
                {categories.map((category) => (
                    <button
                        key={category._id}
                        onClick={() => handleCategoryClick(category._id)}
                        className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === category._id
                            ? "bg-blue-600 text-white shadow-md"
                            : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                    >
                        {category.name}
                    </button>
                ))}
            </div>
        </div>
    );
}
