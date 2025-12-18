import React from 'react';
import TravelTips from '@/components/TravelTips';
import { getTravelTipsPosts } from '@/lib/db/queries';

export const revalidate = 60;

export default async function TravelTipsPage() {
    const posts = await getTravelTipsPosts();

    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Travel Tips & Experiences
                    </h1>
                    <p className="mt-4 text-lg text-gray-500">
                        Logistics, guides, and advice for your medical journey.
                    </p>
                </div>

                <TravelTips posts={posts} />
            </div>
        </div>
    );
}
