"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, X, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { useCategories } from "@/hooks/useCategories";

export default function AdminCreatePollPage() {
    const router = useRouter();
    const { categories, loading: categoriesLoading } = useCategories();

    const [question, setQuestion] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [options, setOptions] = useState(["", ""]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addOption = () => {
        if (options.length < 10) {
            setOptions([...options, ""]);
        }
    };

    const removeOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!question.trim()) {
            toast.error("Please enter a question");
            return;
        }

        if (!selectedCategory) {
            toast.error("Please select a category");
            return;
        }

        const validOptions = options.filter(opt => opt.trim() !== "");
        if (validOptions.length < 2) {
            toast.error("Please provide at least 2 options");
            return;
        }

        setIsSubmitting(true);
        const toastId = toast.loading("Creating poll...");

        try {
            const response = await fetch("/api/polls", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    question,
                    categoryId: selectedCategory,
                    options: validOptions,
                    isAdminPost: true, // Mark as admin post
                }),
            });

            if (response.ok) {
                toast.success("Poll created successfully!", { id: toastId });
                router.push("/admin/polls");
            } else {
                const error = await response.json();
                toast.error(error.error || "Failed to create poll", { id: toastId });
            }
        } catch (error) {
            console.error("Error creating poll:", error);
            toast.error("Failed to create poll", { id: toastId });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">Create Poll (Admin)</h1>

            <form onSubmit={handleSubmit} className="max-w-3xl space-y-6 bg-white rounded-lg shadow-sm border p-6">
                {/* Question */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Poll Question <span className="text-red-500">*</span>
                    </label>
                    <Input
                        type="text"
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="What would you like to ask?"
                        className="w-full"
                        maxLength={200}
                    />
                    <p className="text-xs text-gray-500 mt-1">{question.length}/200</p>
                </div>

                {/* Category */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Category <span className="text-red-500">*</span>
                    </label>
                    {categoriesLoading ? (
                        <div className="text-sm text-gray-500">Loading categories...</div>
                    ) : (
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="">Select a category</option>
                            {categories.map((cat) => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Options */}
                <div>
                    <label className="block text-sm font-medium mb-2">
                        Poll Options <span className="text-red-500">*</span>
                    </label>
                    <div className="space-y-3">
                        {options.map((option, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={option}
                                    onChange={(e) => updateOption(index, e.target.value)}
                                    placeholder={`Option ${index + 1}`}
                                    className="flex-1"
                                    maxLength={100}
                                />
                                {options.length > 2 && (
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => removeOption(index)}
                                        className="text-red-500 hover:bg-red-50"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                    {options.length < 10 && (
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={addOption}
                            className="mt-3"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Option
                        </Button>
                    )}
                    <p className="text-xs text-gray-500 mt-2">
                        ℹ️ Polls created by admin will show "Anonymous" as the author
                    </p>
                </div>

                {/* Submit */}
                <div className="flex gap-3 pt-4">
                    <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                        {isSubmitting ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Creating...
                            </>
                        ) : (
                            "Create Poll"
                        )}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => router.push("/admin/polls")}
                        disabled={isSubmitting}
                    >
                        Cancel
                    </Button>
                </div>
            </form>
        </div>
    );
}
