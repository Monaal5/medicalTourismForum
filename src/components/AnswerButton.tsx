"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  PenTool,
  Search,
  ArrowRight,
  MessageCircle,
  Hash,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
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
  };
  createdAt: string;
  answerCount?: number;
  isAnswered: boolean;
}

interface AnswerButtonProps {
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
  suppressHydrationWarning?: boolean;
}

export default function AnswerButton({
  className = "",
  variant = "outline",
  size = "sm",
  suppressHydrationWarning,
}: AnswerButtonProps) {
  const { user } = useUser();
  const [isOpen, setIsOpen] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(
    new Set(),
  );

  // Fetch categories when dialog opens
  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen]);

  // Fetch questions when category is selected
  useEffect(() => {
    if (selectedCategory) {
      fetchQuestions(selectedCategory);
    }
  }, [selectedCategory]);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/categories");

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCategories(data.categories || []);
        } else {
          // API returned error, set empty categories
          setCategories([]);
        }
      } else {
        // API endpoint not available or error
        setCategories([]);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      // Set empty categories on error
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestions = async (categoryId: string) => {
    try {
      setLoadingQuestions(true);
      const response = await fetch(
        `/api/questions?category=${categoryId}&unanswered=true`,
      );

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setQuestions(data.questions || []);
        } else {
          // API returned error, set empty questions
          setQuestions([]);
        }
      } else {
        // API endpoint not available or error
        setQuestions([]);
      }
    } catch (error) {
      console.error("Error fetching questions:", error);
      // Set empty questions on error
      setQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getCategoryIcon = (iconName?: string) => {
    return <Hash className="w-4 h-4" />;
  };

  const getCategoryColor = (color?: string) => {
    const colorMap: { [key: string]: string } = {
      blue: "text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100",
      green: "text-green-600 bg-green-50 border-green-200 hover:bg-green-100",
      red: "text-red-600 bg-red-50 border-red-200 hover:bg-red-100",
      purple:
        "text-purple-600 bg-purple-50 border-purple-200 hover:bg-purple-100",
      orange:
        "text-orange-600 bg-orange-50 border-orange-200 hover:bg-orange-100",
      pink: "text-pink-600 bg-pink-50 border-pink-200 hover:bg-pink-100",
      gray: "text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100",
    };
    return colorMap[color || "gray"] || colorMap.gray;
  };

  const toggleCategoryExpansion = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const filteredCategories = categories.filter(
    (category) =>
      category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const filteredQuestions = questions.filter(
    (question) =>
      question.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      question.description?.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleReset = () => {
    setSelectedCategory(null);
    setQuestions([]);
    setSearchQuery("");
    setExpandedCategories(new Set());
  };

  if (!user) {
    return null; // Don't show answer button if not logged in
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant={variant}
          size={size}
          className={`border-blue-600 text-blue-600 hover:bg-blue-50 ${className}`}
        >
          <PenTool className="w-4 h-4 mr-2" />
          Answer
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <PenTool className="w-5 h-5 text-blue-600" />
            <span>Answer a Question</span>
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col h-full">
          {/* Search Bar */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder={
                selectedCategory
                  ? "Search questions..."
                  : "Search categories..."
              }
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Navigation breadcrumb */}
          {selectedCategory && (
            <div className="flex items-center space-x-2 mb-4 text-sm">
              <button
                onClick={handleReset}
                className="text-blue-600 hover:text-blue-800 transition-colors"
              >
                Categories
              </button>
              <ArrowRight className="w-3 h-3 text-gray-400" />
              <span className="text-gray-900 font-medium">
                {categories.find((c) => c._id === selectedCategory)?.name ||
                  "Questions"}
              </span>
            </div>
          )}

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto">
            {!selectedCategory ? (
              /* Categories View */
              <div className="space-y-2">
                {loading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div
                        key={i}
                        className="h-16 bg-gray-100 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div
                      key={category._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${getCategoryColor(category.color)}`}
                      onClick={() => setSelectedCategory(category._id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getCategoryIcon(category.icon)}
                          <div>
                            <h3 className="font-semibold text-sm">
                              {category.name}
                            </h3>
                            {category.description && (
                              <p className="text-xs text-gray-600 mt-1">
                                {category.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-gray-500">
                            {category.questionCount || 0} questions
                          </span>
                          <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Hash className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No categories found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? "No categories match your search."
                        : "No categories available."}
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Questions View */
              <div className="space-y-3">
                {loadingQuestions ? (
                  <div className="space-y-3">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className="h-20 bg-gray-100 rounded-lg animate-pulse"
                      ></div>
                    ))}
                  </div>
                ) : filteredQuestions.length > 0 ? (
                  filteredQuestions.map((question) => (
                    <div
                      key={question._id}
                      className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                            {question.title}
                          </h3>
                          {question.description && (
                            <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                              {question.description}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>by {question.author.username}</span>
                            <span>
                              {formatDistanceToNow(
                                new Date(question.createdAt),
                              )}{" "}
                              ago
                            </span>
                            <div className="flex items-center space-x-1">
                              <MessageCircle className="w-3 h-3" />
                              <span>{question.answerCount || 0} answers</span>
                            </div>
                          </div>
                        </div>
                        <Link href={`/question/${question._id}?answer=true`}>
                          <Button size="sm" className="ml-4">
                            Answer
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <MessageCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No questions found
                    </h3>
                    <p className="text-gray-500 mb-4">
                      {searchQuery
                        ? "No questions match your search in this category."
                        : "No questions available in this category yet."}
                    </p>
                    <div className="flex flex-col space-y-2">
                      <Button variant="outline" onClick={handleReset}>
                        Browse Other Categories
                      </Button>
                      <Link href="/ask">
                        <Button variant="default" className="w-full">
                          Ask a Question
                        </Button>
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="border-t border-gray-200 pt-4 mt-4 flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {selectedCategory
                ? `${filteredQuestions.length} questions in this category`
                : `${filteredCategories.length} categories available`}
            </div>
            <div className="flex items-center space-x-2">
              {selectedCategory && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  Back to Categories
                </Button>
              )}
              <Link href="/ask">
                <Button variant="outline" size="sm">
                  Ask New Question
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
