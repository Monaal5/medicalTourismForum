
import { formatDistanceToNow } from "date-fns";
import { Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import PostCard from "@/components/PostCard";
import { supabase } from "@/lib/supabase";

interface PostWithDetails {
    _id: string;
    postTitle: string;
    body?: any[];
    image?: any;
    publishedAt: string;
    author: {
        username: string;
        imageUrl: string;
        clerkId?: string;
    };
    subreddit: {
        title: string;
        slug: {
            current: string;
        };
    };
    voteCount?: number;
    userVote?: "upvote" | "downvote" | null;
    commentCount?: number;
}

interface CommunityDetails {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    description?: string;
    createdAt: string;
    moderator?: {
        username: string;
    };
    image?: {
        asset?: {
            url: string;
        };
    };
}

interface CommunityPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CommunityPage({ params }: CommunityPageProps) {
    const { slug } = await params;
    let posts: PostWithDetails[] = [];
    let community: CommunityDetails | null = null;
    let loading = false;

    try {
        // Fetch community details from Supabase
        const { data: communityData, error } = await supabase
            .from('communities')
            .select(`
                *,
                moderator:users(username)
            `)
            .eq('slug', slug)
            .single();

        if (error || !communityData) {
            console.error("Community fetch error:", error);
            // Don't throw Immediately, let the null check handle it below
        } else {
            // Map Supabase to Sanity-like structure
            community = {
                _id: communityData.id,
                title: communityData.title,
                slug: { current: communityData.slug },
                description: communityData.description,
                createdAt: communityData.created_at,
                moderator: communityData.moderator ? { username: communityData.moderator.username } : undefined,
                image: communityData.image_url ? { asset: { url: communityData.image_url } } : undefined
            };

            // Fetch posts for this community from Supabase
            // Note: Schema for posts might fetch based on 'community_id'
            const { data: postsData } = await supabase
                .from('posts')
                .select(`
                    *,
                    author:users(username, image_url, clerk_id),
                    community:communities(title, slug)
                `)
                .eq('community_id', communityData.id)
                .order('created_at', { ascending: false });

            if (postsData) {
                posts = postsData.map((post: any) => ({
                    _id: post.id,
                    postTitle: post.title,
                    body: post.body ? [{ _type: 'block', children: [{ _type: 'span', text: typeof post.body === 'string' ? post.body : "Content" }] }] : [],
                    image: post.image_url ? { asset: { url: post.image_url } } : undefined,
                    publishedAt: post.created_at || post.published_at,
                    author: {
                        username: post.author?.username || 'user',
                        imageUrl: post.author?.image_url || '',
                        clerkId: post.author?.clerk_id
                    },
                    subreddit: {
                        title: post.community?.title || '',
                        slug: { current: post.community?.slug || '' }
                    },
                    voteCount: 0, // Implement vote count query if needed
                    commentCount: 0 // Implement comment count if needed
                }));
            }
        }

    } catch (error) {
        console.error("Error fetching community data:", error);
        loading = true;
    }

    if (loading) {
        // ... (existing loading state)
        return (
            <div className="min-h-screen bg-gray-50">
                <div className="max-w-4xl mx-auto p-4">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!community) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">
                        Community not found
                    </h1>
                    <p className="text-gray-600">
                        The community you're looking for doesn't exist.
                    </p>
                    <Link
                        href="/"
                        className="text-blue-600 hover:underline mt-4 inline-block"
                    >
                        Go back to home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-4xl mx-auto p-4">
                {/* Community Header */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                    <div className="flex items-center space-x-4">
                        {community.image && community.image.asset?.url ? (
                            <div className="w-16 h-16 rounded-full overflow-hidden relative">
                                <Image
                                    src={community.image.asset.url}
                                    alt={community.title}
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        ) : (
                            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xl">
                                {community.title.charAt(0).toUpperCase()}
                            </div>
                        )}
                        <div className="flex-1">
                            <h1 className="text-2xl font-bold text-gray-900">
                                {community.title}
                            </h1>
                            <p className="text-gray-600">{community.description}</p>
                            <div className="flex items-center text-sm text-gray-500 mt-2">
                                {community.moderator && (
                                    <>
                                        <span>Created by u/{community.moderator.username}</span>
                                        <span className="mx-1">•</span>
                                    </>
                                )}
                                <span>
                                    {formatDistanceToNow(new Date(community.createdAt), {
                                        addSuffix: true,
                                    })}
                                </span>
                            </div>
                        </div>
                        <Link
                            href={`/communities/${slug}/create-post`}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center space-x-2"
                        >
                            <Plus className="w-4 h-4" />
                            <span>Create Post</span>
                        </Link>
                    </div>
                </div>

                {/* Posts */}
                <div className="space-y-4">
                    {posts.map((post) => (
                        <PostCard key={post._id} post={post} />
                    ))}
                </div>

                {posts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-gray-500">No posts in this community yet.</p>
                        <Link
                            href={`/communities/${slug}/create-post`}
                            className="text-blue-600 hover:underline mt-2 inline-block"
                        >
                            Create the first post
                        </Link>
                    </div>
                )}
            </div>
        </div>
    );
}
