import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        const category = await adminClient.fetch(
            `*[_type == "category" && slug.current == $slug][0]{
                _id,
                name,
                "slug": slug.current,
                description,
                icon,
                color
            }`,
            { slug }
        );

        if (!category) {
            return NextResponse.json({ error: "Category not found" }, { status: 404 });
        }

        return NextResponse.json({ category });
    } catch (error) {
        console.error("Error fetching category:", error);
        return NextResponse.json(
            { error: "Internal server error" },
            { status: 500 }
        );
    }
}
