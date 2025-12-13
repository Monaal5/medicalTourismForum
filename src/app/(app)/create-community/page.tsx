"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Users, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function CreateCommunityPage() {
    const router = useRouter();
    const { user, isLoaded } = useUser();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
    });

    if (!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            </div>
        );
    }

    if (!user) {
        router.push("/sign-in");
        return null;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.title.trim()) return;

        setLoading(true);
        const toastId = toast.loading("Creating community...");

        try {
            const response = await fetch("/api/communities", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    title: formData.title,
                    description: formData.description,
                    userId: user.id,
                    userEmail: user.primaryEmailAddress?.emailAddress,
                    userFullName: user.fullName,
                    userImageUrl: user.imageUrl,
                }),
            });

            const data = await response.json();

            if (response.ok && data.success) {
                toast.success("Community created successfully!", { id: toastId });
                router.push(`/communities/${data.community.slug.current}`);
            } else {
                toast.error(data.error || "Failed to create community", { id: toastId });
            }
        } catch (error) {
            console.error("Error creating community:", error);
            toast.error("An error occurred", { id: toastId });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-2xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 sm:p-8">
                    <div className="flex items-center space-x-3 mb-6">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Create a Community</h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <Label htmlFor="title">Name</Label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500 font-medium">c/</span>
                                <Input
                                    id="title"
                                    placeholder="community_name"
                                    className="pl-8"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    maxLength={21}
                                    required
                                />
                            </div>
                            <p className="text-sm text-gray-500">
                                Community names including capitalization cannot be changed.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Textarea
                                id="description"
                                placeholder="What is your community about?"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                rows={4}
                                maxLength={500}
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-end space-x-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.back()}
                                disabled={loading}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-blue-600 hover:bg-blue-700 text-white min-w-[120px]"
                                disabled={loading || !formData.title.trim()}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                        Creating...
                                    </>
                                ) : (
                                    "Create Community"
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
