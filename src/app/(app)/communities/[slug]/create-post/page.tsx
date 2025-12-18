
import CreatePostForm from "@/components/CreatePostForm";
import { supabase } from "@/lib/supabase";
import Link from "next/link";

interface CommunityDetails {
    _id: string;
    title: string;
    slug: {
        current: string;
    };
    description?: string;
    createdAt?: string;
    moderator?: {
        username: string;
    };
}

interface CreatePostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

export default async function CreatePostPage({ params }: CreatePostPageProps) {
    const { slug } = await params;
    let community: CommunityDetails | null = null;
    let loading = false;

    try {
        const { data: communityData, error } = await supabase
            .from('communities')
            .select('id, title, slug, description, created_at')
            .eq('slug', slug)
            .single();

        if (error || !communityData) {
            // console.error("Error fetching community:", error);
            // community remains null
        } else {
            community = {
                _id: communityData.id,
                title: communityData.title,
                slug: { current: communityData.slug },
                description: communityData.description,
                createdAt: communityData.created_at
            };
        }

    } catch (error) {
        console.error("Error fetching subreddit:", error);
        loading = true; // Technically error state
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    <Link href="/" className="text-blue-500 hover:underline mt-4 block">
                        Go Home
                    </Link>
                </div>
            </div>
        );
    }

    return <CreatePostForm community={community} />;
}
