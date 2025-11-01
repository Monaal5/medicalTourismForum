import { NextResponse } from 'next/server';
import { sanityFetch } from '@/sanity/lib/live';
import { defineQuery } from 'groq';

const allCommunitiesQuery = defineQuery(`
  *[_type == "subreddit"] | order(createdAt desc) {
    _id,
    title,
    slug
  }
`);

export async function GET() {
  try {
    const result = await sanityFetch({
      query: allCommunitiesQuery,
      params: {}
    });

    return NextResponse.json({ 
      communities: result.data || [] 
    });
  } catch (error) {
    console.error("Error fetching communities:", error);
    return NextResponse.json({ 
      communities: [] 
    }, { status: 500 });
  }
}
