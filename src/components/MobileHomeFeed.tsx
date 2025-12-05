"use client";
import { useState } from "react";
import ModernQuestionCard from "@/components/ModernQuestionCard";
import CategoryPills from "@/components/CategoryPills";

interface MobileHomeFeedProps {
    initialQuestions: any[];
    initialPosts: any[];
    categories: any[];
}

export default function MobileHomeFeed({ initialQuestions, initialPosts, categories }: MobileHomeFeedProps) {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    const filteredQuestions = selectedCategory
        ? initialQuestions.filter((q) => q.category?._id === selectedCategory)
        : initialQuestions;

    // Posts don't always have a category field in the same way, or might be linked to subreddits.
    // Assuming for now we filter posts if they have a matching category or if we just show questions when filtering.
    // Let's check the Post interface in page.tsx. It has 'subreddit'.
    // If filtering by category, we might only want to show questions, OR we need to map categories to subreddits.
    // For simplicity, if a category is selected, we'll filter questions by it.
    // If we want to filter posts, we'd need a way to match them.
    // The user request specifically mentioned "questions related that category".

    const displayPosts = selectedCategory ? [] : initialPosts; // Hide posts when filtering by category for now, unless we can match them.

    return (
        <>
            <CategoryPills
                categories={categories.slice(0, 6)}
                onCategoryChange={setSelectedCategory}
            />

            <main className="px-4 pt-4 space-y-8 max-w-2xl mx-auto">
                {(filteredQuestions.length > 0 || displayPosts.length > 0) ? (
                    <>
                        {displayPosts.map((post) => (
                            <ModernQuestionCard
                                key={post._id}
                                question={{
                                    ...post,
                                    title: post.postTitle,
                                    createdAt: post.publishedAt,
                                    answerCount: post.commentCount,
                                    type: 'post',
                                } as any}
                            />
                        ))}
                        {filteredQuestions.map((question) => (
                            <ModernQuestionCard key={question._id} question={{ ...question, type: 'question' } as any} />
                        ))}
                    </>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                            <span className="text-2xl">❓</span>
                        </div>
                        <h3 className="text-lg font-semibold text-card-foreground mb-2">
                            No content found
                        </h3>
                        <p className="text-sm text-muted-foreground mb-4">
                            Try selecting a different category or ask a new question.
                        </p>
                        <a
                            href="/ask"
                            className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors font-medium"
                        >
                            Ask a Question
                        </a>
                    </div>
                )}
            </main>
        </>
    );
}
