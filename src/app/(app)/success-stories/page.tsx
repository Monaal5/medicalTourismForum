import React from 'react';
import SuccessStories from '@/components/SuccessStories';
import { getSuccessStoriesPosts } from '@/lib/db/queries';

export const revalidate = 60; // Revalidate every minute

export default async function SuccessStoriesPage() {
    const posts = await getSuccessStoriesPosts();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl sm:tracking-tight lg:text-6xl">
                        Success Stories
                    </h1>
                    <p className="mt-5 max-w-xl mx-auto text-xl text-gray-500">
                        Real stories from real people who found their path to healing.
                    </p>
                </div>

                <SuccessStories posts={posts} />
            </div>
        </div>
    );
}
