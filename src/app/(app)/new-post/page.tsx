"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { ArrowLeft, HelpCircle, Image as ImageIcon, Video, X, PlusCircle, Hash, Sparkles } from "lucide-react";
import Link from "next/link";
import SignInPrompt from "@/components/SignInPrompt";

interface Category {
    _id: string;
    name: string;
    slug: string;
    description?: string;
    icon?: string;
    color?: string;
}

function NewPostPageContent() {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState(""); // This will be postBody
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>("");
    const [mediaFiles, setMediaFiles] = useState<Array<{
        file: File;
        preview: string;
        type: 'image' | 'video';
    }>>([]);
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");
    const [existingTags, setExistingTags] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);

    const generateDescription = async () => {
        if (!title.trim()) {
            setError("Please enter a title first to generate a description.");
            return;
        }
        setIsGeneratingDescription(true);
        try {
            const response = await fetch("/api/ai/suggest-description", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ title, currentBody: description }),
            });
            const data = await response.json();
            if (data.suggestion) {
                setDescription(data.suggestion);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (error) {
            console.error("Error generating description:", error);
            setError("Failed to generate description.");
        } finally {
            setIsGeneratingDescription(false);
        }
    };

    const generateTags = async () => {
        if (!title.trim() && !description.trim()) {
            setError("Please enter a title or description to generate tags.");
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
                // Merge distinct tags
                const newTags = [...new Set([...tags, ...data.tags])].slice(0, 5);
                setTags(newTags);
            } else if (data.error) {
                setError(data.error);
            }
        } catch (error) {
            console.error("Error generating tags:", error);
            setError("Failed to generate tags.");
        } finally {
            setIsGeneratingTags(false);
        }
    };

    useEffect(() => {
        const categoryParam = searchParams.get("category");
        if (categoryParam) setSelectedCategory(categoryParam);
    }, [searchParams]);

    useEffect(() => {
        fetchCategories();
        // Cleanup object URLs on unmount
        return () => {
            mediaFiles.forEach(file => URL.revokeObjectURL(file.preview));
        };
    }, []);

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

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            const processedFiles = newFiles.map(file => ({
                file,
                preview: URL.createObjectURL(file),
                type: file.type.startsWith('video/') ? 'video' : 'image' as 'image' | 'video'
            }));
            setMediaFiles(prev => [...prev, ...processedFiles]);
        }
    };

    const removeMedia = (index: number) => {
        setMediaFiles(prev => {
            const newFiles = [...prev];
            URL.revokeObjectURL(newFiles[index].preview);
            newFiles.splice(index, 1);
            return newFiles;
        });
    };

    const fileToBase64 = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = error => reject(error);
        });
    };

    if (!isLoaded) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (!user) {
        return (
            <SignInPrompt
                icon={HelpCircle}
                title="Sign in to create a post"
                description="Join our medical community to share your knowledge"
                action="create posts"
            />
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return setError("You must be logged in to create a post");
        if (!title.trim()) return setError("Title is required");
        if (!selectedCategory) return setError("Category is required");

        setLoading(true);
        setError("");

        try {
            // 1. Upload Media Files First
            const uploadedMedia = [];

            for (const media of mediaFiles) {
                // Get Signed URL
                const signRes = await fetch("/api/upload/sign", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        filename: media.file.name,
                        contentType: media.file.type
                    })
                });

                if (!signRes.ok) {
                    throw new Error(`Failed to get upload URL for ${media.file.name}`);
                }

                const { signedUrl, publicUrl } = await signRes.json();

                // Upload to Supabase using Signed URL
                const uploadRes = await fetch(signedUrl, {
                    method: "PUT",
                    body: media.file,
                    headers: {
                        "Content-Type": media.file.type
                    }
                });

                if (!uploadRes.ok) {
                    throw new Error(`Failed to upload ${media.file.name}`);
                }

                uploadedMedia.push({
                    url: publicUrl,
                    type: media.type, // 'image' or 'video'
                    filename: media.file.name
                });
            }

            // 2. Submit Post Data with Media URLs
            const formData = new FormData();
            formData.append("postTitle", title.trim());
            if (description.trim()) {
                formData.append("postBody", description.trim());
            }
            formData.append("subredditId", selectedCategory);
            formData.append("userId", user.id);
            if (user.primaryEmailAddress?.emailAddress) {
                formData.append("userEmail", user.primaryEmailAddress.emailAddress);
            }
            if (user.fullName) {
                formData.append("userFullName", user.fullName);
            }
            if (user.imageUrl) {
                formData.append("userImageUrl", user.imageUrl);
            }
            if (tags.length > 0) {
                formData.append("tags", JSON.stringify(tags));
            }

            // Append the uploaded media info instead of raw files
            if (uploadedMedia.length > 0) {
                formData.append("mediaUrls", JSON.stringify(uploadedMedia));
            }

            const response = await fetch("/api/posts", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();
            if (result.error) {
                setError(result.error);
            } else if (result.post) {
                router.push(`/post/${result.post._id}`);
            }
        } catch (error: any) {
            console.error("Error creating post:", error);
            setError(error.message || "Failed to create post. Please try again.");
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
                    <h1 className="text-3xl font-bold text-gray-900">Create a Post</h1>
                    <p className="text-gray-600">
                        Share your thoughts with the community
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
                                Post Title
                            </Label>
                            <Input
                                id="title"
                                placeholder="Give your post a title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="mt-2 text-lg"
                                required
                                maxLength={200}
                                minLength={5}
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {title.length}/200 characters
                            </p>
                        </div>

                        {/* Media Upload */}
                        <div>
                            <Label className="text-lg font-medium text-gray-900 mb-2 block">
                                Media Gallery (Optional)
                            </Label>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                {mediaFiles.map((media, index) => (
                                    <div key={index} className="relative group aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                        {media.type === 'video' ? (
                                            <video src={media.preview} className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={media.preview} className="w-full h-full object-cover" alt="preview" />
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => removeMedia(index)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                        <div className="absolute bottom-1 left-1 bg-black/50 text-white text-xs px-2 py-1 rounded">
                                            {media.type === 'video' ? <Video className="w-3 h-3" /> : <ImageIcon className="w-3 h-3" />}
                                        </div>
                                    </div>
                                ))}

                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors">
                                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                        <PlusCircle className="w-8 h-8 text-gray-400 mb-2" />
                                        <p className="text-xs text-center text-gray-500 px-2">
                                            Add Photos/Videos
                                        </p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        multiple
                                        accept="image/*,video/*"
                                        onChange={handleFileSelect}
                                    />
                                </label>
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <Label
                                htmlFor="description"
                                className="text-lg font-medium text-gray-900"
                            >
                                Caption (optional)
                            </Label>
                            <div className="flex justify-end mb-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateDescription}
                                    disabled={isGeneratingDescription}
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    {isGeneratingDescription ? "Generating..." : "AI Suggest"}
                                </Button>
                            </div>
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="Write something..."
                            />
                        </div>

                        {/* Tags */}
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <Label
                                    htmlFor="tags"
                                    className="text-lg font-medium text-gray-900"
                                >
                                    Add tags (optional)
                                </Label>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={generateTags}
                                    disabled={isGeneratingTags}
                                    className="text-purple-600 hover:text-purple-700 hover:bg-purple-50"
                                >
                                    <Sparkles className="w-4 h-4 mr-1" />
                                    {isGeneratingTags ? "Generating..." : "AI Suggest"}
                                </Button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="tags"
                                    placeholder="Type a tag and press Enter"
                                    value={tagInput}
                                    onChange={(e) => {
                                        setTagInput(e.target.value);
                                        setShowSuggestions(true);
                                    }}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    onFocus={() => setShowSuggestions(true)}
                                    onKeyDown={handleAddTag}
                                    maxLength={20}
                                />
                                <p className="text-sm text-gray-500 mt-1">
                                    Press Enter to add tags. Maximum 5 tags.
                                </p>

                                {/* Tag Suggestions */}
                                {tagInput && showSuggestions && (
                                    <div className="absolute z-10 w-full max-w-md bg-white border border-gray-200 rounded-md shadow-lg mt-1">
                                        {existingTags
                                            .filter(tag => tag.toLowerCase().includes(tagInput.toLowerCase()) && !tags.includes(tag))
                                            .slice(0, 5)
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

                        {/* Category */}
                        <div>
                            <Label
                                htmlFor="category"
                                className="text-lg font-medium text-gray-900"
                            >
                                Select Category
                            </Label>
                            <div className="mt-2 space-y-2">
                                <select
                                    id="category"
                                    value={selectedCategory}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select a category...</option>
                                    {categories.map((category) => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
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
                                disabled={loading || !title.trim() || !selectedCategory}
                                className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                                {loading ? "Creating Post..." : "Create Post"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default function NewPostPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            }
        >
            <NewPostPageContent />
        </Suspense>
    );
}
