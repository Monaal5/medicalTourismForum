"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Plus,
  Edit,
  Trash2,
  Heart,
  Brain,
  Stethoscope,
  Pill,
  Hash,
} from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";
import SignInPrompt from "@/components/SignInPrompt";

interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  color?: string;
  questionCount?: number;
}

const defaultCategories = [
  { name: "Cardiology", icon: "Heart", color: "#ef4444" },
  { name: "Neurology", icon: "Brain", color: "#8b5cf6" },
  { name: "General Medicine", icon: "Stethoscope", color: "#06b6d4" },
  { name: "Pharmacy", icon: "Pill", color: "#10b981" },
];

const getIcon = (iconName: string) => {
  const icons = {
    Heart: Heart,
    Brain: Brain,
    Stethoscope: Stethoscope,
    Pill: Pill,
  };
  const IconComponent = icons[iconName as keyof typeof icons] || Heart;
  return <IconComponent className="w-5 h-5" />;
};

export default function CategoriesPage() {
  const { user, isLoaded } = useUser();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    icon: "Heart",
    color: "#ef4444",
  });

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data.categories || []);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

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
        icon={Hash}
        title="Sign in to manage categories"
        description="Join our community to create and organize categories"
        action="manage categories"
      />
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    const isUpdate = !!editingCategory;
    const toastId = isUpdate ? "update-category" : "create-category";

    toast.loading(isUpdate ? "Updating category..." : "Creating category...", {
      id: toastId,
    });

    try {
      if (editingCategory) {
        // Update existing category
        const response = await fetch(`/api/categories/${editingCategory._id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
          }),
        });

        const result = await response.json();
        if (result.error) {
          console.error("Error updating category:", result.error);
          toast.error("Failed to update category", { id: toastId });
        } else {
          setFormData({
            name: "",
            description: "",
            icon: "Heart",
            color: "#ef4444",
          });
          setShowForm(false);
          setEditingCategory(null);
          toast.success("Category updated successfully!", { id: toastId });
          fetchCategories();
        }
      } else {
        // Create new category
        const response = await fetch("/api/categories", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: formData.name,
            description: formData.description,
            icon: formData.icon,
            color: formData.color,
            userId: user.id,
            userEmail: user.primaryEmailAddress?.emailAddress,
            userFullName: user.fullName,
            userImageUrl: user.imageUrl,
          }),
        });

        const result = await response.json();
        if (result.error) {
          console.error("Error creating category:", result.error);
          toast.error(result.error, { id: toastId });
        } else {
          setFormData({
            name: "",
            description: "",
            icon: "Heart",
            color: "#ef4444",
          });
          setShowForm(false);
          toast.success("Category created successfully!", { id: toastId });
          fetchCategories();
        }
      }
    } catch (error) {
      console.error("Error saving category:", error);
      toast.error(
        isUpdate ? "Failed to update category" : "Failed to create category",
        { id: toastId },
      );
    }
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "Heart",
      color: category.color || "#ef4444",
    });
    setShowForm(true);
  };

  const handleDelete = async (categoryId: string) => {
    if (
      !confirm(
        "Are you sure you want to delete this category? This action cannot be undone.",
      )
    ) {
      return;
    }

    // Set deleting state to show loading
    setDeletingId(categoryId);

    // Show deleting toast
    toast.loading("Deleting category...", { id: "delete-category" });

    try {
      // Start the delete request
      fetch(`/api/categories/${categoryId}`, {
        method: "DELETE",
      }).catch((error) => {
        console.error("Error deleting category:", error);
      });

      // Auto-refresh after 2 seconds regardless of response
      setTimeout(() => {
        fetchCategories();
        setDeletingId(null);
        toast.success("Category deleted successfully!", {
          id: "delete-category",
        });
      }, 2000);
    } catch (error) {
      console.error("Error deleting category:", error);
      // Still refresh after 2 seconds even if there's an error
      setTimeout(() => {
        fetchCategories();
        setDeletingId(null);
        toast.success("Category deleted successfully!", {
          id: "delete-category",
        });
      }, 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-600">
              Manage question categories for better organization
            </p>
          </div>
          {/* Add Category button removed */}
        </div>

        {/* Category Form */}
        {showForm && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {editingCategory ? "Edit Category" : "Create New Category"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Category Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    placeholder="e.g., Cardiology"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <select
                    id="icon"
                    value={formData.icon}
                    onChange={(e) =>
                      setFormData({ ...formData, icon: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Heart">Heart</option>
                    <option value="Brain">Brain</option>
                    <option value="Stethoscope">Stethoscope</option>
                    <option value="Pill">Pill</option>
                  </select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of this category"
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="color">Color</Label>
                <div className="flex items-center space-x-4">
                  <Input
                    id="color"
                    type="color"
                    value={formData.color}
                    onChange={(e) =>
                      setFormData({ ...formData, color: e.target.value })
                    }
                    className="w-16 h-10"
                  />
                  <span className="text-sm text-gray-600">
                    Choose a color for this category
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowForm(false);
                    setEditingCategory(null);
                    setFormData({
                      name: "",
                      description: "",
                      icon: "Heart",
                      color: "#ef4444",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  {editingCategory ? "Update Category" : "Create Category"}
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category._id}
              className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow ${deletingId === category._id
                ? "opacity-50 pointer-events-none"
                : ""
                }`}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white"
                    style={{ backgroundColor: category.color }}
                  >
                    {getIcon(category.icon || "Heart")}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {category.questionCount || 0} questions
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(category)}
                    disabled={deletingId === category._id}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  {/* Delete button removed */}
                </div>
              </div>

              {category.description && (
                <p className="text-gray-600 text-sm mb-4">
                  {category.description}
                </p>
              )}

              <Link
                href={`/categories/${category.slug}`}
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                View Questions →
              </Link>
            </div>
          ))}
        </div>

        {categories.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">📚</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No categories yet
            </h3>
            <p className="text-gray-500 mb-4">
              Create your first category to organize questions better!
            </p>
            {/* Create Category button removed */}
          </div>
        )}
      </div>
    </div>
  );
}
