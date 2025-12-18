
"use client";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, ImageIcon, PenTool, Sparkles, X, Plus, BarChart2, Trash2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SignInPrompt from "@/components/SignInPrompt";

interface CommunityDetails {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
}

interface Category {
  _id: string;
  name: string;
  slug: string;
}

interface CreatePostFormProps {
  community: CommunityDetails;
}

export default function CreatePostForm({ community }: CreatePostFormProps) {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [postTitle, setPostTitle] = useState("");
  const [postBody, setPostBody] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState("");
  const [isGeneratingTags, setIsGeneratingTags] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  // Poll State
  const [showPoll, setShowPoll] = useState(false);

  useEffect(() => {
    if (searchParams?.get("type") === "poll") {
      setShowPoll(true);
    }
  }, [searchParams]);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);

  const handleAddOption = () => {
    if (pollOptions.length < 5) setPollOptions([...pollOptions, ""]);
  };

  const handleRemoveOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Fetch categories
    setLoadingCategories(true);
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      })
      .catch((err) => console.error("Failed to fetch categories", err))
      .finally(() => setLoadingCategories(false));
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const validTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
      ];
      const maxSize = 5 * 1024 * 1024; // 5MB

      if (!validTypes.includes(file.type)) {
        setErrorMessage(
          "Please select a valid image file (JPEG, PNG, GIF, or WebP)",
        );
        return;
      }

      if (file.size > maxSize) {
        setErrorMessage("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImageFile(null);
      setImagePreview(null);
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
        icon={PenTool}
        title="Sign in to create a post"
        description="Join our community to share your content and connect with others"
        action="create posts"
      />
    );
  }

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !postTitle.trim() || !postBody.trim()) {
      setErrorMessage("Title and body are required.");
      return;
    }

    if (!selectedCategory) {
      setErrorMessage("Please select a category.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("postTitle", postTitle.trim());
      formData.append("postBody", postBody.trim());
      formData.append("communityId", community._id);
      formData.append("categoryId", selectedCategory);
      formData.append("userId", user.id);
      formData.append("tags", JSON.stringify(tags));
      formData.append("isAnonymous", String(isAnonymous));

      // Clerk details if needed for logging
      // formData.append("userEmail", user.primaryEmailAddress?.emailAddress || "");
      // formData.append("userFullName", user.fullName || "");
      // formData.append("userImageUrl", user.imageUrl || "");

      if (imageFile) {
        formData.append("mediaFiles", imageFile);
      }

      if (showPoll && pollQuestion.trim() && pollOptions.every(o => o.trim())) {
        formData.append("pollData", JSON.stringify({
          question: pollQuestion,
          options: pollOptions
        }));
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        body: formData,
        // Don't set Content-Type header manually when using FormData, 
        // browser sets it with boundary automatically
      });

      const result = await response.json();

      if (result.error) {
        setErrorMessage(result.error);
      } else if (result.post) {
        router.push(`/post/${result.post._id}`);
      }
    } catch (error) {
      console.error("Error creating post:", error);
      setErrorMessage("Failed to create post. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement> | React.MouseEvent) => {
    if (e.type === 'keydown' && (e as React.KeyboardEvent).key !== 'Enter') return;
    e.preventDefault();

    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const generateTags = async () => {
    if (!postTitle.trim() && !postBody.trim()) {
      setErrorMessage("Please enter a title or body to generate tags.");
      return;
    }

    setIsGeneratingTags(true);
    try {
      const response = await fetch("/api/ai/suggest-tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: postTitle, content: postBody }),
      });

      const data = await response.json();
      if (data.tags && Array.isArray(data.tags)) {
        // Merge with existing unique tags
        const newTags = [...new Set([...tags, ...data.tags])];
        setTags(newTags);
      }
    } catch (error) {
      console.error("Error generating tags:", error);
    } finally {
      setIsGeneratingTags(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6">
          <Link
            href={`/communities/${community.slug.current}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to c/{community.title}
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create Post</h1>
          <p className="text-gray-600">
            Create a post in the <strong>c/{community.title}</strong> community
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMessage && (
              <div className="text-red-500 text-sm">{errorMessage}</div>
            )}

            <div>
              <label
                htmlFor="postTitle"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Title
              </label>
              <Input
                id="postTitle"
                placeholder="Title of your post"
                value={postTitle}
                onChange={(e) => setPostTitle(e.target.value)}
                required
                maxLength={300}
              />
            </div>

            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <Select onValueChange={setSelectedCategory} value={selectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a category..." />
                </SelectTrigger>
                <SelectContent>
                  {loadingCategories ? (
                    <div className="p-2 text-sm text-gray-500">Loading categories...</div>
                  ) : (
                    categories.map((cat) => (
                      <SelectItem key={cat._id} value={cat._id}>
                        {cat.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>


            <div>
              <label
                htmlFor="postBody"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Body (optional)
              </label>
              <Textarea
                id="postBody"
                placeholder="Text (optional)"
                value={postBody}
                onChange={(e) => setPostBody(e.target.value)}
                rows={6}
              />
            </div>

            {/* Tags Section */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags
              </label>
              <div className="flex gap-2 mb-2">
                <Input
                  placeholder="Add a tag (e.g., #dental, #turkey)..."
                  value={currentTag}
                  onChange={(e) => setCurrentTag(e.target.value)}
                  onKeyDown={handleAddTag}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAddTag}
                >
                  Add
                </Button>
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

              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="ml-1.5 inline-flex items-center justify-center text-blue-400 hover:text-blue-600 focus:outline-none"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div>
              <label
                htmlFor="post-image"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Image (optional)
              </label>
              {imagePreview ? (
                <div className="relative w-32 h-32 mb-4">
                  <Image
                    src={imagePreview}
                    alt="Image Preview"
                    fill
                    className="object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm"
                  >
                    x
                  </button>
                </div>
              ) : (
                <label
                  htmlFor="post-image"
                  className="flex flex-col items-center justify-center w-full h-24 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex flex-col items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-500" />
                    <p className="text-xs text-gray-500">
                      Click to upload an image
                    </p>
                  </div>
                  <input
                    id="post-image"
                    name="image"
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* Poll Creation */}
            <div>
              {!showPoll ? (
                <Button type="button" variant="outline" size="sm" onClick={() => setShowPoll(true)} className="flex items-center gap-2 text-gray-600">
                  <BarChart2 className="w-4 h-4" />
                  Create Poll
                </Button>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 relative">
                  <button type="button" onClick={() => setShowPoll(false)} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">
                    <X className="w-4 h-4" />
                  </button>
                  <h3 className="font-semibold text-sm mb-3 text-gray-900">Poll Details</h3>
                  <div className="space-y-3">
                    <Input
                      placeholder="Ask a question..."
                      value={pollQuestion}
                      onChange={(e) => setPollQuestion(e.target.value)}
                      className="bg-white"
                    />
                    <div className="space-y-2">
                      {pollOptions.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input
                            placeholder={`Option ${idx + 1}`}
                            value={opt}
                            onChange={(e) => handleOptionChange(idx, e.target.value)}
                            className="bg-white"
                          />
                          {pollOptions.length > 2 && (
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveOption(idx)}>
                              <Trash2 className="w-4 h-4 text-gray-400" />
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                    {pollOptions.length < 5 && (
                      <Button type="button" variant="ghost" size="sm" onClick={handleAddOption} className="text-blue-600">
                        <Plus className="w-4 h-4 mr-1" /> Add Option
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Anonymous Toggle */}
            <div className="flex items-center space-x-2 pt-2">
              <input
                type="checkbox"
                id="isAnonymous"
                checked={isAnonymous}
                onChange={(e) => setIsAnonymous(e.target.checked)}
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="isAnonymous" className="text-sm text-gray-700 select-none">
                Post anonymously (your name will be hidden)
              </label>
            </div>

            <Button
              type="submit"
              disabled={isSubmitting || !user}
              className="w-full bg-red-600 hover:bg-red-700 text-white"
            >
              {isSubmitting ? "Creating Post..." : "Post"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
