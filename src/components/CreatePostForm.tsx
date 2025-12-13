"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { ArrowLeft, ImageIcon, PenTool } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import SignInPrompt from "@/components/SignInPrompt";

interface CommunityDetails {
  _id: string;
  title: string;
  slug: {
    current: string;
  };
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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

    setIsSubmitting(true);
    setErrorMessage("");

    try {
      let imageBase64: string | null = null;
      let imageFileName: string | null = null;
      let imageContentType: string | null = null;

      if (imageFile) {
        imageBase64 = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(imageFile);
        });
        imageFileName = imageFile.name;
        imageContentType = imageFile.type;
      }

      const response = await fetch("/api/posts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          postTitle: postTitle.trim(),
          postBody: postBody.trim(),
          subredditId: community._id,
          userId: user.id,
          userEmail: user.primaryEmailAddress?.emailAddress,
          userFullName: user.fullName,
          userImageUrl: user.imageUrl,
          imageBase64,
          imageFileName,
          imageContentType,
        }),
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
