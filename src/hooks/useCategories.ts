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

    useEffect(() => {
        fetchCategories();
    }, []);



    return { categories, loading, error, refetch: fetchCategories };
}
