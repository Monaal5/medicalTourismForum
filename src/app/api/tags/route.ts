
import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET() {
    try {
        // Fetch unique tags from all questions
        // This GROQ query collects all tags arrays and flattens them, then deduplicates
        const tags = await adminClient.fetch(
            `array::unique(*[_type == "question" && defined(tags)].tags[])`
        );

        return NextResponse.json({ tags: tags || [] });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}
