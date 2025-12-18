import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { formatDistanceToNow } from 'date-fns';
import { User, MessageCircle, Plane, MapPin } from 'lucide-react';

interface TravelTipsProps {
    posts: any[];
}

export default function TravelTips({ posts }: TravelTipsProps) {
    if (!posts || posts.length === 0) {
        return (
            <div className="text-center py-20">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">No Travel Tips Yet</h3>
                <p className="text-gray-600">Share your travel experiences and advice!</p>
                <Link href="/create-post?category=travel-tips" className="inline-block mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Share a Tip
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {posts.map((post) => (
                <Link key={post._id} href={`/post/${post._id}`} className="group block">
                    <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-gray-100 flex flex-col md:flex-row">
                        <div className="relative md:w-1/3 min-h-[200px] md:min-h-0 bg-gray-100">
                            {post.image?.asset?.url ? (
                                <Image
                                    src={post.image.asset.url}
                                    alt={post.postTitle}
                                    fill
                                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-blue-50">
                                    <Plane className="w-12 h-12 text-blue-200" />
                                </div>
                            )}
                        </div>

                        <div className="p-6 md:w-2/3 flex flex-col justify-center">
                            <div className="flex items-center space-x-2 mb-2">
                                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded uppercase tracking-wide">
                                    Travel Tip
                                </span>
                                {post.subreddit && (
                                    <span className="text-xs text-gray-500 flex items-center">
                                        <MapPin className="w-3 h-3 mr-1" />
                                        {post.subreddit.title}
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                                {post.postTitle}
                            </h3>

                            <p className="text-gray-600 mb-4 line-clamp-2 text-sm">
                                {Array.isArray(post.body)
                                    ? post.body.map((b: any) => b.children?.map((c: any) => c.text).join('')).join(' ')
                                    : typeof post.body === 'object' && (post.body as any).content
                                        ? String((post.body as any).content).replace(/<[^>]*>?/gm, '')
                                        : ''}
                            </p>

                            <div className="flex items-center justify-between mt-auto">
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
                                <div className="flex items-center space-x-4 text-gray-500 text-xs">
                                    <span>{formatDistanceToNow(new Date(post.publishedAt))} ago</span>
                                    <span className="flex items-center space-x-1">
                                        <MessageCircle className="w-3 h-3" />
                                        <span>{post.commentCount || 0}</span>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </Link>
            ))}
        </div>
    );
}
