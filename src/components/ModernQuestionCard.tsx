"use client";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
    ThumbsUp,
    MessageCircle,
    Share2,
    Bookmark,
    MoreVertical,
    Edit,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

interface ModernQuestionCardProps {
    question: {
        _id: string;
        title: string;
        description?: string;
        author: {
            username: string;
            imageUrl: string;
        };
        category?: {
            _id: string;
            name: string;
            color: string;
        };
        image?: {
            asset: {
                url: string;
            };
            alt?: string;
        };
        createdAt: string;
        answerCount?: number;
        voteCount?: number;
        type?: 'question' | 'post';
        tags?: string[];
    };
}

export default function ModernQuestionCard({ question }: ModernQuestionCardProps) {
    const [isBookmarked, setIsBookmarked] = useState(false);
    const isPost = question.type === 'post';
    const href = isPost ? `/post/${question._id}` : `/question/${question._id}`;

    const getCategoryColor = (color?: string) => {
        const colors = {
            blue: "bg-blue-500 text-white",
            green: "bg-green-500 text-white",
            red: "bg-red-500 text-white",
            purple: "bg-purple-500 text-white",
            orange: "bg-orange-500 text-white",
            pink: "bg-pink-500 text-white",
        };
        return colors[color as keyof typeof colors] || "bg-blue-500 text-white";
    };

    // Truncate description
    const truncateText = (text: string, maxLength: number) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + "...";
    };

    return (
        <div className="block relative group">
            <div className="bg-card rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 border border-border">
                {/* Main Card Link Overlay */}
                <Link href={href} className="absolute inset-0 z-0" aria-label="View Question">
                    <span className="sr-only">View Question</span>
                </Link>

                {/* Image Section */}
                {question.image?.asset?.url && (
                    <div className="relative w-full h-48 bg-muted">
                        <Image
                            src={question.image.asset.url}
                            alt={question.image.alt || question.title}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                )}

                {/* Content Section */}
                <div className="p-4 pointer-events-none">
                    {/* Author Info - Enable pointer events for this interactive child */}
                    <div className="flex items-center space-x-2 mb-3 pointer-events-auto relative z-10">
                        <Link href={`/profile/${question.author.username}`} className="flex-shrink-0">
                            <Image
                                src={question.author.imageUrl || "/default-avatar.png"}
                                alt={question.author.username}
                                width={32}
                                height={32}
                                className="rounded-full w-8 h-8 object-cover"
                                unoptimized
                            />
                        </Link>
                        <div className="flex flex-col">
                            <Link
                                href={`/profile/${question.author.username}`}
                                className="text-sm font-semibold text-card-foreground hover:text-blue-600 transition-colors"
                            >
                                {question.author.username}
                            </Link>
                            {question.category && (
                                <span
                                    className={`text-[10px] px-1.5 py-0.5 rounded-full w-fit ${getCategoryColor(question.category.color)}`}
                                >
                                    {question.category.name}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-card-foreground mb-2 line-clamp-2 leading-tight">
                        {question.title}
                    </h3>

                    {/* Description */}
                    {question.description && (
                        <div
                            className="text-sm text-muted-foreground mb-3 line-clamp-2"
                            dangerouslySetInnerHTML={{
                                __html: truncateText(
                                    question.description.replace(/<[^>]*>/g, ""),
                                    120
                                ),
                            }}
                        />
                    )}

                    {/* Read More Link */}
                    <div className="mb-4">
                        <span className="text-blue-600 dark:text-blue-400 text-sm font-medium hover:underline">
                            read more
                        </span>
                    </div>

                    {/* Tags */}
                    {question.tags && question.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mb-3 pointer-events-auto relative z-10">
                            {question.tags.map((tag, index) => (
                                <Link
                                    key={index}
                                    href={`/search?q=${tag}`}
                                    className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] sm:text-xs rounded-full hover:bg-blue-100 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    #{tag}
                                </Link>
                            ))}
                        </div>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-3 border-t border-border">
                        <div className="flex items-center space-x-4">
                            {/* Answer Count */}
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <MessageCircle className="w-4 h-4" />
                                <span className="text-xs">{question.answerCount || 0}</span>
                            </div>
                            {/* Vote Count */}
                            <div className="flex items-center space-x-1 text-muted-foreground">
                                <ThumbsUp className="w-4 h-4" />
                                <span className="text-xs">{question.voteCount || 0}</span>
                            </div>
                        </div>

                        {/* Action Buttons - Enable pointer events */}
                        <div className="flex items-center space-x-2 pointer-events-auto relative z-10">
                            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors text-muted-foreground">
                                <Share2 className="w-4 h-4" />
                            </button>
                            <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full text-xs font-medium transition-colors">
                                <Edit className="w-3.5 h-3.5" />
                                <span>Answer</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
}
