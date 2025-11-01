"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Users, Hash, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function CreateCommunityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    slug: "",
    category: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Auto-generate slug from title
    if (name === "title") {
      const slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      setFormData(prev => ({
        ...prev,
        slug: slug
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.description.trim()) {
      toast.error("Please fill in all required fields");
      return;
    }

    setLoading(true);
    try {
      // Here you would typically make an API call to create the community
      // For now, we'll simulate the process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Community created successfully!");
      router.push(`/community/${formData.slug}`);
    } catch (error) {
      console.error("Error creating community:", error);
      toast.error("Failed to create community");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <Link href="/communities" className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Communities
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Create a Community</h1>
          <p className="text-gray-600">
            Create a new community for people to discuss topics, share experiences, and connect.
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Community Name */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2 block">
                Community Name *
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500 font-medium">r/</span>
                <Input
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="Enter community name"
                  className="flex-1"
                  required
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Choose a name that clearly describes your community's purpose
              </p>
            </div>

            {/* Slug */}
            <div>
              <Label htmlFor="slug" className="text-sm font-medium text-gray-700 mb-2 block">
                URL Slug
              </Label>
              <div className="flex items-center space-x-2">
                <span className="text-gray-500">/community/</span>
                <Input
                  id="slug"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  placeholder="community-url-slug"
                  className="flex-1"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This will be the URL for your community (auto-generated from name)
              </p>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2 block">
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Describe what your community is about..."
                rows={4}
                className="resize-none"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Give people a clear idea of what your community is about
              </p>
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-gray-700 mb-2 block">
                Category
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a category</option>
                <option value="medical-tourism">Medical Tourism</option>
                <option value="healthcare">Healthcare</option>
                <option value="wellness">Wellness & Lifestyle</option>
                <option value="medical-advice">Medical Advice</option>
                <option value="general">General Discussion</option>
              </select>
            </div>

            {/* Community Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-900 mb-2">Community Guidelines</h3>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>• Be respectful and inclusive</li>
                <li>• No spam or self-promotion</li>
                <li>• Keep discussions relevant to the community topic</li>
                <li>• Follow medical forum guidelines</li>
              </ul>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <Link href="/communities">
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </Link>
              <Button
                type="submit"
                disabled={loading}
                className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? "Creating..." : "Create Community"}</span>
              </Button>
            </div>
          </form>
        </div>

        {/* Tips */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Tips for a Great Community</h3>
          <div className="space-y-3 text-sm text-gray-600">
            <div className="flex items-start space-x-3">
              <Hash className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Clear Purpose:</strong> Make sure your community has a clear, focused purpose that will attract the right members.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Users className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Engage Members:</strong> Be active in your community and encourage discussions to keep members engaged.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <Hash className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <strong>Moderate Content:</strong> Set clear guidelines and moderate content to maintain a healthy community environment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
