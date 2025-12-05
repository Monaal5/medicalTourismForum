"use client";
import { useState, useEffect } from "react";
import ModernQuestionCard from "@/components/ModernQuestionCard";
import CategoryPills from "@/components/CategoryPills";
import BottomNavigation from "@/components/BottomNavigation";
import FloatingActionButton from "@/components/FloatingActionButton";
import ModernHeader from "@/components/ModernHeader";

interface Question {
    _id: string;
    title: string;
    description?: string;
    author: {
        username: string;
        imageUrl: string;
    };
    category?: {
        _id: string;
        name: string;
        color: string;
    };
    image?: {
        asset: {
            url: string;
        };
        alt?: string;
    };
    createdAt: string;
    answerCount?: number;
    voteCount?: number;
}

interface Category {
    _id: string;
    name: string;
    slug: string;
    color?: string;
}

export default function ModernHomePage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            // Fetch questions
            const questionsRes = await fetch("/api/questions");
            const questionsData = await questionsRes.json();
            if (questionsData.success) {
                setQuestions(questionsData.questions || []);
            }

            // Fetch categories
            const categoriesRes = await fetch("/api/categories");
            const categoriesData = await categoriesRes.json();
            if (categoriesData.success) {
                setCategories(categoriesData.categories || []);
            }
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuestions = selectedCategory
        ? questions.filter((q) => q.category?._id === selectedCategory)
        : questions;

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <ModernHeader />
                <div className="p-4 space-y-4 pb-20">
                    {[...Array(3)].map((_, i) => (
                        <div
                            key={i}
                            className="bg-card rounded-2xl overflow-hidden animate-pulse"
                        >
                            <div className="h-48 bg-muted" />
                            <div className="p-4 space-y-3">
                                <div className="h-4 bg-muted rounded w-1/4" />
                                <div className="h-6 bg-muted rounded w-3/4" />
                                <div className="h-4 bg-muted rounded w-full" />
                                <div className="h-4 bg-muted rounded w-2/3" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-6">
            {/* Modern Header */}
            <ModernHeader />

            {/* Category Pills */}
            <CategoryPills
                categories={categories}
                onCategoryChange={setSelectedCategory}
            />

            {/* Main Content */}
            <main className="px-4 pt-4 space-y-4 max-w-2xl mx-auto">
                {filteredQuestions.length > 0 ? (
                    filteredQuestions.map((question) => (
                        <ModernQuestionCard key={question._id} question={question} />
                    ))
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">
                            No questions yet
                        </h3>
                        <p className="text-sm text-muted-foreground">
                            Be the first to ask a question!
                        </p>
                    </div>
                )}
            </main>

            {/* Floating Action Button */}
            <FloatingActionButton />

            {/* Bottom Navigation (Mobile Only) */}
            <BottomNavigation />
        </div>
    );
}
