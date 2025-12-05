"use client";
import { useState, useEffect } from "react";
import ModernQuestionCard from "@/components/ModernQuestionCard";
import CategoryPills from "@/components/CategoryPills";
import ModernHeader from "@/components/ModernHeader";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

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

export default function AnswerPage() {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [questionsRes, categoriesRes] = await Promise.all([
                fetch("/api/questions"),
                fetch("/api/categories")
            ]);

            const questionsData = await questionsRes.json();
            const categoriesData = await categoriesRes.json();

            if (questionsData.success) setQuestions(questionsData.questions || []);
            if (categoriesData.success) setCategories(categoriesData.categories || []);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredQuestions = questions.filter((q) => {
        const matchesCategory = selectedCategory ? q.category?._id === selectedCategory : true;
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });

    return (
        <div className="min-h-screen bg-background pb-20 md:pb-6">
            <ModernHeader />

            <div className="max-w-3xl mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-2">Answer Questions</h1>
                <p className="text-muted-foreground mb-4">Select a question to share your knowledge</p>

                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                        placeholder="Search questions to answer..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Categories */}
                <div className="mb-6">
                    <CategoryPills
                        categories={categories}
                        onCategoryChange={setSelectedCategory}
                    />
                </div>

                {/* Questions List */}
                {loading ? (
                    <div className="space-y-4">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="bg-card h-48 rounded-2xl animate-pulse bg-muted" />
                        ))}
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredQuestions.length > 0 ? (
                            filteredQuestions.map((question) => (
                                <ModernQuestionCard key={question._id} question={question} />
                            ))
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-muted-foreground">No questions found matching your criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
