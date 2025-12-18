import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { User, MessageCircle, Heart } from 'lucide-react';

interface SuccessStoriesProps {
    posts: any[];
}

export default function SuccessStories({ posts }: SuccessStoriesProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Success Stories Yet</h3>
                <p className="text-gray-600">Be the first to share your journey!</p>
                <Link href="/create-post?category=success-stories" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Share Your Story
                </Link>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post) => (
                <Link key={post._id} href={`/post/${post._id}`} className="group block h-full">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow h-full border border-gray-100 flex flex-col">
                        <div className="relative aspect-video bg-gray-100">
                            {post.image?.asset?.url ? (
                                <Image
                                    src={post.image.asset.url}
                                    alt={post.postTitle}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                                    <Heart className="w-12 h-12 text-blue-200" />
                                </div>
                            )}
                            <div className="absolute top-4 left-4">
                                <span className="bg-white/90 backdrop-blur-sm text-blue-600 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
                                    Success Story
                                </span>
                            </div>
                        </div>

                        <div className="p-6 flex-1 flex flex-col">
                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors line-clamp-2">
                                {post.postTitle}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-3 text-sm flex-1">
                                {Array.isArray(post.body)
                                    ? post.body.map((b: any) => b.children?.map((c: any) => c.text).join('')).join(' ')
                                    : typeof post.body === 'object' && (post.body as any).content
                                        ? String((post.body as any).content).replace(/<[^>]*>?/gm, '')
                                        : ''}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                <div className="flex items-center space-x-2">
                                    <div className="relative w-6 h-6 rounded-full overflow-hidden bg-gray-100">
                                        {post.author.imageUrl ? (
                                            <Image
                                                src={post.author.imageUrl}
                                                alt={post.author.username}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <User className="w-4 h-4 m-1 text-gray-400" />
                                        )}
                                    </div>
                                    <span className="text-xs font-medium text-gray-900">{post.author.username}</span>
                                </div>
                                <span className="text-xs text-gray-500">
                                    {formatDistanceToNow(new Date(post.publishedAt))} ago
                                </span>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
