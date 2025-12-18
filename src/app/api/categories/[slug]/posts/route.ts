import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        console.log(`[API] Fetching posts for category slug: ${slug}`);

        // First get category ID
        const category = await adminClient.fetch(
            `*[_type == "category" && slug.current == $slug][0]{ _id }`,
            { slug }
        );

        if (!category) {
            console.log(`[API] Category not found for slug: ${slug}`);
            return NextResponse.json({ posts: [] });
        }

        console.log(`[API] Found category: ${category._id}`);

        // Fetch posts for this category
        const posts = await adminClient.fetch(
            `*[_type == "post" && category._ref == $categoryId] | order(_createdAt desc) {
                _id,
                title,
                "slug": slug.current,
                _createdAt,
                author->{
                    name
                }
            }`,
            { categoryId: category._id }
        );

        console.log(`[API] Found ${posts.length} posts`);

        return NextResponse.json({ posts });
    } catch (error) {
        console.error("Error fetching posts:", error);
        return NextResponse.json({ posts: [] });
    }
}
