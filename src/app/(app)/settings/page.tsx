"use client";
import React, { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Camera,
  Save,
  User,
  Mail,
  Calendar,
  Eye,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { generateUsername } from "@/lib/username";

export default function ProfilePage() {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [sanityUsername, setSanityUsername] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch username from Sanity to match what's used in posts/questions
  useEffect(() => {
    if (user?.id) {
      fetch(`/api/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.username) {
            setSanityUsername(data.username);
          }
        })
        .catch((error) => {
          console.error("Error fetching user from Sanity:", error);
        });
    }
  }, [user?.id]);

  // Get username - use Sanity username if available, otherwise generate
  const getUsername = () => {
    if (!user) return "user";

    // Use Sanity username if we have it (this matches posts/questions)
    if (sanityUsername) return sanityUsername;

    // Fallback to generated username while loading
    return (
      user.username ||
      generateUsername(user.fullName || user.firstName || "User", user.id)
    );
  };

  // Get user's public profile URL
  const getPublicProfileUrl = () => {
    if (!user) return "/";
    return `/profile/${getUsername()}`;
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        toast.error("Image size must be less than 5MB");
        return;
      }

      if (!file.type.startsWith("image/")) {
        toast.error("Please select a valid image file");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    try {
      // Update user profile in Clerk
      await user.update({
        firstName: firstName || user.firstName,
        lastName: lastName || user.lastName,
      });

      // If there's an image file, upload it
      if (imageFile) {
        const formData = new FormData();
        formData.append("file", imageFile);

        const response = await fetch("/api/user/upload-image", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          const { imageUrl } = await response.json();
          // Update user's image URL in Clerk
          await user.setProfileImage({ file: imageFile });
        } else {
          const error = await response.json();
          throw new Error(error.error || "Failed to upload image");
        }
      }

      toast.success("Profile updated successfully!");

      // Reset form
      setImageFile(null);
      setImagePreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Sign in required
          </h1>
          <p className="text-gray-600">
            You need to be logged in to view your profile.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header with navigation */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link
              href="/"
              className="flex items-center text-gray-600 hover:text-gray-800"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Home
            </Link>
          </div>
          <Link
            href={getPublicProfileUrl()}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>View Public Profile</span>
          </Link>
        </div>

        <div className="bg-card rounded-lg shadow-sm border border-border p-6">
          <div className="border-b border-gray-200 pb-4 mb-6">
            <h1 className="text-2xl font-bold text-card-foreground">
              Account Settings
            </h1>
            <p className="text-gray-600 mt-1">
              Manage your profile information and account settings
            </p>
          </div>

          <div className="space-y-6">
            {/* Profile Picture Section */}
            <div>
              <Label className="text-lg font-medium text-card-foreground mb-4 block">
                Profile Picture
              </Label>
              <div className="flex items-center space-x-6">
                <div className="relative">
                  {imagePreview ? (
                    <Image
                      src={imagePreview}
                      alt="Profile preview"
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover border-4 border-gray-200"
                    />
                  ) : (
                    <div className="w-30 h-30 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
                      <User className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center space-x-2"
                  >
                    <Camera className="w-4 h-4" />
                    <span>Change Photo</span>
                  </Button>
                  {imagePreview && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={removeImage}
                      className="text-red-600 hover:text-red-700"
                    >
                      Remove
                    </Button>
                  )}
                </div>
              </div>
            </div>

            {/* User Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="firstName"
                  className="text-sm font-medium text-gray-700"
                >
                  First Name
                </Label>
                <div className="mt-1 flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder={user.firstName || "Enter first name"}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="lastName"
                  className="text-sm font-medium text-gray-700"
                >
                  Last Name
                </Label>
                <div className="mt-1 flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder={user.lastName || "Enter last name"}
                    className="bg-white"
                  />
                </div>
              </div>

              <div>
                <Label
                  htmlFor="email"
                  className="text-sm font-medium text-gray-700"
                >
                  Email Address
                </Label>
                <div className="mt-1 flex items-center space-x-2">
                  <Mail className="w-4 h-4 text-gray-400" />
                  <Input
                    id="email"
                    value={user.primaryEmailAddress?.emailAddress || ""}
                    readOnly
                    className="bg-gray-50"
                  />
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-card-foreground mb-4">
                Account Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    User ID
                  </Label>
                  <div className="mt-1">
                    <Input
                      value={user.id}
                      readOnly
                      className="bg-gray-50 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-700">
                    Member Since
                  </Label>
                  <div className="mt-1 flex items-center space-x-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <Input
                      value={
                        user.createdAt
                          ? new Date(user.createdAt).toLocaleDateString()
                          : "N/A"
                      }
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Button
                onClick={handleSave}
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Saving..." : "Save Changes"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
