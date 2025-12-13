"use client";

import { useState } from "react";
import Link from "next/link";
import { Users, MessageCircle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

interface Community {
    _id: string;
    title: string;
    description?: string;
    slug: {
        current: string;
    };
    memberCount?: number;
    postCount?: number;
    createdAt: string;
    moderator?: {
        clerkId?: string;
    };
}

interface CommunityCardProps {
    community: Community;
    currentUserId?: string | null;
    index: number;
}

export default function CommunityCard({ community, currentUserId, index }: CommunityCardProps) {
    const router = useRouter();
    const [isDeleting, setIsDeleting] = useState(false);

    const isModerator = currentUserId && community.moderator?.clerkId === currentUserId;

    const getCommunityIcon = (title: string) => {
        return title.charAt(0).toUpperCase();
    };

    const getCommunityColor = (idx: number) => {
        const colors = [
            "bg-blue-500",
            "bg-green-500",
            "bg-red-500",
            "bg-purple-500",
            "bg-orange-500",
            "bg-pink-500",
            "bg-indigo-500",
            "bg-teal-500"
        ];
        return colors[idx % colors.length];
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent link navigation if inside a Link (though the button is separate)

        if (!confirm("Are you sure you want to delete this community? This action cannot be undone.")) {
            return;
        }

        setIsDeleting(true);
        const toastId = toast.loading("Deleting community...");

        try {
            const response = await fetch(`/api/communities/${community._id}`, {
                method: "DELETE",
            });

            if (response.ok) {
                toast.success("Community deleted successfully", { id: toastId });
                router.refresh(); // Refresh server components to remove the deleted item
            } else {
                const data = await response.json();
                toast.error(data.error || "Failed to delete community", { id: toastId });
                setIsDeleting(false);
            }
        } catch (error) {
            console.error("Error deleting community:", error);
            toast.error("Failed to delete community", { id: toastId });
            setIsDeleting(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow relative group">
            <div className="flex items-start space-x-4">
                <div className={`w-12 h-12 ${getCommunityColor(index)} rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                    {getCommunityIcon(community.title)}
                </div>
                <div className="flex-1 min-w-0">
                    <Link href={`/communities/${community.slug.current}`}>
                        <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 transition-colors mb-1">
                            r/{community.title}
                        </h3>
                    </Link>
                    {community.description && (
                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                            {community.description}
                        </p>
                    )}
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{community.memberCount || 0} members</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <MessageCircle className="w-4 h-4" />
                            <span>{community.postCount || 0} posts</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100 flex gap-2">
                <Link href={`/communities/${community.slug.current}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full">
                        View Community
                    </Button>
                </Link>

                {isModerator && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:bg-red-50 hover:text-red-600"
                        onClick={handleDelete}
                        disabled={isDeleting}
                    >
                        {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </Button>
                )}
            </div>
        </div>
    );
}
