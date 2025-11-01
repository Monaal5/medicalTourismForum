"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import QuestionCard from "@/components/QuestionCard";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

interface Question {
  _id: string;
  title: string;
  description?: string;
  author: {
    username: string;
    imageUrl: string;
  };
  category?: {
    name: string;
    color: string;
    icon: string;
  };
  tags?: string[];
  isAnswered: boolean;
  isDeleted: boolean;
  createdAt: string;
  answerCount?: number;
  topAnswer?: {
    _id: string;
    content: any[];
    author: {
      username: string;
      imageUrl: string;
    };
    voteCount?: number;
    userVote?: "upvote" | "downvote" | null;
    createdAt: string;
  };
}

export default function CategoryPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [category, setCategory] = useState<Category | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      fetchCategoryAndQuestions();
    }
  }, [slug]);

  const fetchCategoryAndQuestions = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch category details
      const categoryResponse = await fetch("/api/categories");
      if (categoryResponse.ok) {
        const categoryData = await categoryResponse.json();
        const foundCategory = categoryData.categories?.find(
          (cat: Category) => cat.slug === slug
        );

        if (foundCategory) {
          setCategory(foundCategory);

          // Fetch questions for this category
          const questionsResponse = await fetch(
            `/api/questions?category=${foundCategory._id}`
          );
          if (questionsResponse.ok) {
            const questionsData = await questionsResponse.json();
            setQuestions(questionsData.questions || []);
          }
        } else {
          setError("Category not found");
        }
      }
    } catch (error) {
      console.error("Error fetching category:", error);
      setError("Failed to load category");
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (iconName: string) => {
    const icons: { [key: string]: string } = {
      Heart: "❤️",
      Brain: "🧠",
      Stethoscope: "🩺",
      Pill: "💊",
    };
    return icons[iconName] || "📚";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-6xl mx-auto p-4">
          <Link
            href="/categories"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Categories
          </Link>
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Category Not Found
            </h3>
            <p className="text-gray-500 mb-4">
              The category you're looking for doesn't exist.
            </p>
            <Link href="/categories">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                View All Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <Link
          href="/categories"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Categories
        </Link>

        {/* Category Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white text-2xl"
                style={{ backgroundColor: category.color || "#3b82f6" }}
              >
                {getIcon(category.icon || "Heart")}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {category.name}
                </h1>
                {category.description && (
                  <p className="text-gray-600 mt-1">{category.description}</p>
                )}
                <p className="text-sm text-gray-500 mt-2">
                  {questions.length} question{questions.length !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
            <Link href={`/ask?category=${category._id}`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Ask Question</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Questions List */}
        {questions.length > 0 ? (
          <div className="space-y-4">
            {questions.map((question) => (
              <QuestionCard key={question._id} question={question} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">💬</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No questions yet in this category
            </h3>
            <p className="text-gray-500 mb-4">
              Be the first to ask a question in {category.name}!
            </p>
            <Link href={`/ask?category=${category._id}`}>
              <Button className="bg-red-600 hover:bg-red-700 text-white flex items-center space-x-2 mx-auto">
                <Plus className="w-4 h-4" />
                <span>Ask Question</span>
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
