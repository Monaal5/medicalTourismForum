"use client";
export const dynamic = "force-dynamic"; // Prevent prerendering

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { ArrowLeft, Hash, HelpCircle, Plus, Sparkles } from "lucide-react";
import Link from "next/link";
import SignInPrompt from "@/components/SignInPrompt";
import toast from "react-hot-toast";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
}

function AskQuestionPageContent() {
  const { user, isLoaded } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [existingTags, setExistingTags] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);


  // All hooks must be called before any conditional returns
  useEffect(() => {
    // Pre-fill title if coming from header
    const queryTitle = searchParams.get("q");
    if (queryTitle) setTitle(queryTitle);

    // Pre-select category if coming from category page
    const categoryParam = searchParams.get("category");
    if (categoryParam) setSelectedCategory(categoryParam);
  }, [searchParams]);

  useEffect(() => {
    // Fetch categories
    fetchCategories();
  }, []);

  const fetchTags = async (query?: string) => {
    try {
      const url = query
        ? `/api/tags?q=${encodeURIComponent(query)}`
        : "/api/tags";
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setExistingTags(data.tags || []);
      }
    } catch (error) {
      console.error("Error fetching tags:", error);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTags(tagInput);
    }, 300);
    return () => clearTimeout(timer);
  }, [tagInput]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  // Show loading while checking auth
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Show sign-in prompt if user is not authenticated
  if (!user) {
    return (
      <SignInPrompt
        icon={HelpCircle}
        title="Sign in to ask a question"
        description="Join our medical community to ask questions and get expert answers"
        action="ask questions"
      />
    );
  }



  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && tagInput.trim()) {
      e.preventDefault();
      if (!tags.includes(tagInput.trim()) && tags.length < 5) {
        setTags([...tags, tagInput.trim()]);
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const generateTags = async () => {
    if (!title && !description) {
      toast.error("Please enter a title or details to generate tags.");
      return;
    }

    setIsGeneratingTags(true);
    try {
      const response = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content: description }),
      });

      const data = await response.json();
      if (data.tags && Array.isArray(data.tags)) {
        // Merge with existing unique tags, max 5, but let's allow more if AI suggests
        const newTags = [...new Set([...tags, ...data.tags])].slice(0, 7);
        setTags(newTags);
        toast.success("Tags generated!");
      }
    } catch (error) {
      console.error("Error generating tags:", error);
      toast.error("Failed to generate tags");
    } finally {
      setIsGeneratingTags(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return setError("You must be logged in to ask a question");
    if (!title.trim()) return setError("Title is required");

    setLoading(true);
    setError("");

    // Add pending tag input if exists
    let finalTags = [...tags];
    if (tagInput.trim() && !tags.includes(tagInput.trim()) && tags.length < 5) {
      finalTags.push(tagInput.trim());
    }

    try {
      const response = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim() || undefined,
          categoryId: selectedCategory || undefined,
          tags: finalTags.length > 0 ? finalTags : undefined,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
          isAnonymous: isAnonymous
        }),
      });

      const result = await response.json();
      if (result.error) setError(result.error);
      else if (result.question) router.push(`/question/${result.question._id}`);
    } catch (error) {
      console.error("Error creating question:", error);
      setError("Failed to create question. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Ask a Question</h1>
          <p className="text-gray-600">
            Share your question with the community
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {/* Title */}
            <div>
              <Label
                htmlFor="title"
                className="text-lg font-medium text-gray-900"
              >
                What's your question?
              </Label>
              <Input
                id="title"
                placeholder="Be specific and clear about what you're asking"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="mt-2 text-lg"
                required
                maxLength={200}
              />
              <p className="text-sm text-gray-500 mt-1">
                {title.length}/200 characters
              </p>
            </div>

            {/* Description */}
            <div>
              <Label
                htmlFor="description"
                className="text-lg font-medium text-gray-900"
              >
                Add more details (optional)
              </Label>
              <RichTextEditor
                value={description}
                onChange={setDescription}
                placeholder="Provide additional context, background, or details"
              />
            </div>

            {/* Category */}
            <div>
              <Label
                htmlFor="category"
                className="text-lg font-medium text-gray-900"
              >
                Select Category (optional)
              </Label>
              <div className="mt-2 space-y-2">
                <select
                  id="category"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="">No category</option>
                  {categories.map((category) => (
                    <option key={category._id} value={category._id}>
                      {category.name}
                    </option>
                  ))}
                </select>


              </div>
            </div>

            {/* Tags */}
            <div>
              <Label
                htmlFor="tags"
                className="text-lg font-medium text-gray-900"
              >
                Add tags (optional)
              </Label>
              <div className="mt-2">
                <div className="flex gap-2">
                  <Input
                    id="tags"
                    placeholder="Type a tag and press Enter"
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowSuggestions(true);
                    }}
                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)} // Delay to allow click
                    onFocus={() => setShowSuggestions(true)}
                    onKeyDown={handleAddTag}
                    maxLength={20}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    onClick={generateTags}
                    disabled={isGeneratingTags}
                    className="bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200"
                  >
                    {isGeneratingTags ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-700 mr-2"></div>
                    ) : (
                      <Sparkles className="w-4 h-4 mr-2" />
                    )}
                    AI Suggest
                  </Button>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Press Enter to add tags. Maximum 5 tags.
                </p>

                {/* Tag Suggestions */}
                {tagInput && showSuggestions && (
                  <div className="absolute z-10 w-full max-w-md bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                    {existingTags
                      .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
                      .slice(0, 5) // Limit to 5 suggestions
                      .map((tag, index) => (
                        <div
                          key={index}
                          className="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                          onClick={() => {
                            if (!tags.includes(tag) && tags.length < 5) {
                              setTags([...tags, tag]);
                              setTagInput("");
                              setShowSuggestions(false);
                            }
                          }}
                        >
                          <Hash className="w-3 h-3 inline mr-2 text-gray-400" />
                          {tag}
                        </div>
                      ))}
                  </div>
                )}

                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full"
                      >
                        <Hash className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleRemoveTag(tag)}
                          className="ml-2 text-gray-500 hover:text-gray-700"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-700 select-none">
                Ask anonymously (your name will be hidden)
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !title.trim()}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {loading ? "Posting Question..." : "Post Question"}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function AskQuestionPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      }
    >
      <AskQuestionPageContent />
    </Suspense>
  );
}
