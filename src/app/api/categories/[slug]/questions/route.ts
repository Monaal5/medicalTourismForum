import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        console.log(`[API] Fetching questions for category slug: ${slug}`);

        // First get category ID
        const category = await adminClient.fetch(
            `*[_type == "category" && slug.current == $slug][0]{ _id, title }`,
            { slug }
        );

        if (!category) {
            console.log(`[API] Category not found for slug: ${slug}`);
            return NextResponse.json({ questions: [] });
        }

        console.log(`[API] Found category: ${category._id}`);

        // Fetch questions for this category
        const questions = await adminClient.fetch(
            `*[_type == "question" && category._ref == $categoryId] | order(_createdAt desc) {
                _id,
                title,
                "slug": slug.current,
                _createdAt,
                "answerCount": count(*[_type == "answer" && references(^._id)])
            }`,
            { categoryId: category._id }
        );

        console.log(`[API] Found ${questions.length} questions`);

        return NextResponse.json({ questions });
    } catch (error) {
        console.error("Error fetching questions:", error);
        return NextResponse.json({ questions: [] });
    }
}
