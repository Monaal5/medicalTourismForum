import React from "react";
import { sanityFetch } from "@/sanity/lib/live";
import { defineQuery } from "groq";
import { Users, Plus, Hash, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
}

const communitiesQuery = defineQuery(`
  *[_type == "subreddit" && !isDeleted] | order(createdAt desc) {
    _id,
    title,
    description,
    slug,
    "memberCount": count(*[_type == "user" && references(^._id)]),
    "postCount": count(*[_type == "post" && references(^._id) && !isDeleted]),
    createdAt
  }
`);

export default async function CommunitiesPage() {
  let communities: Community[] = [];
  let loading = false;

  try {
    const result = await sanityFetch({
      query: communitiesQuery,
      params: {}
    });
    communities = result.data || [];
  } catch (error) {
    console.error("Error fetching communities:", error);
    loading = true;
  }

  const getCommunityIcon = (title: string) => {
    return title.charAt(0).toUpperCase();
  };

  const getCommunityColor = (index: number) => {
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
    return colors[index % colors.length];
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Communities</h1>
              <p className="text-gray-600">
                Discover and join communities related to medical tourism and healthcare
              </p>
            </div>
            <Link href="/communities/create">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                <Plus className="w-4 h-4" />
                <span>Create Community</span>
              </Button>
            </Link>
          </div>
        </div>

        {/* Communities Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {communities.length > 0 ? (
              communities.map((community, index) => (
                <div key={community._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-start space-x-4">
                    <div className={`w-12 h-12 ${getCommunityColor(index)} rounded-full flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                      {getCommunityIcon(community.title)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/community/${community.slug.current}`}>
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
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <Link href={`/community/${community.slug.current}`}>
                      <Button variant="outline" size="sm" className="w-full">
                        View Community
                      </Button>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No communities yet</h3>
                <p className="text-gray-500 mb-4">
                  Be the first to create a community and start building a community around your interests.
                </p>
                <Link href="/communities/create">
                  <Button className="bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-2">
                    <Plus className="w-4 h-4" />
                    <span>Create First Community</span>
                  </Button>
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Featured Communities Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Featured Communities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { name: "Medical Tourism", slug: "medical-tourism", members: "2.1k", color: "bg-blue-500" },
              { name: "Healthcare Questions", slug: "healthcare-questions", members: "1.8k", color: "bg-green-500" },
              { name: "Medical Advice", slug: "medical-advice", members: "1.5k", color: "bg-red-500" },
              { name: "Wellness & Lifestyle", slug: "wellness", members: "1.2k", color: "bg-purple-500" }
            ].map((community, index) => (
              <Link key={community.slug} href={`/community/${community.slug}`}>
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex items-center space-x-3 mb-3">
                    <div className={`w-8 h-8 ${community.color} rounded-full flex items-center justify-center text-white text-sm font-bold`}>
                      {community.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">r/{community.name}</h4>
                      <p className="text-xs text-gray-500">{community.members} members</p>
                    </div>
                  </div>
                  <div className="text-xs text-gray-600">
                    Join discussions about {community.name.toLowerCase()}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
