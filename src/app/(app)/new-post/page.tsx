"use client";
export const dynamic = "force-dynamic";

import { useState, useEffect, Suspense } from "react";
import { useUser } from "@clerk/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/RichTextEditor";
import { ArrowLeft, HelpCircle, Image as ImageIcon, Video, X, PlusCircle } from "lucide-react";
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

            // Append all media files
            mediaFiles.forEach((m) => {
                formData.append("mediaFiles", m.file);
            });

            const response = await fetch("/api/posts", {
                method: "POST",
                body: formData, // No Content-Type header needed, fetch sets it with boundary
            });

            const result = await response.json();
            if (result.error) {
                setError(result.error);
            } else if (result.post) {
                router.push(`/post/${result.post._id}`);
            }
        } catch (error) {
            console.error("Error creating post:", error);
            setError("Failed to create post. Please try again.");
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
                            <RichTextEditor
                                value={description}
                                onChange={setDescription}
                                placeholder="Write something..."
                            />
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
