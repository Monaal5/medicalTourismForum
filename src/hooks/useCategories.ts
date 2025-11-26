import { useState, useEffect } from "react";

export interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
    questionCount?: number;
}

export function useCategories() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await fetch("/api/categories");

            if (!response.ok) {
                throw new Error("Failed to fetch categories");
            }

            const data = await response.json();
            if (data.success) {
                const categories = data.categories || [];
                setCategories(categories);

                // If no categories exist, try to seed sample data
                if (categories.length === 0) {
                    await seedSampleCategories();
                }
            } else {
                throw new Error(data.error || "Unknown error");
            }
        } catch (err) {
            console.error("Error fetching categories:", err);
            setError(
                err instanceof Error ? err.message : "Failed to load categories",
            );
        } finally {
            setLoading(false);
        }
    };

    const seedSampleCategories = async () => {
        try {
            const response = await fetch("/api/seed-categories", {
                method: "POST",
            });

            if (response.ok) {
                const data = await response.json();
                if (data.success) {
                    // Refetch categories after seeding
                    const categoriesResponse = await fetch("/api/categories");
                    if (categoriesResponse.ok) {
                        const categoriesData = await categoriesResponse.json();
                        if (categoriesData.success) {
                            setCategories(categoriesData.categories || []);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Error seeding categories:", error);
        }
    };

    return { categories, loading, error, refetch: fetchCategories };
}
