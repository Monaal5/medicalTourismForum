import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const query = searchParams.get("q") || "";

        // Use RPC to get existing tags (requires 'get_matching_tags' function in DB)
        const { data: tags, error } = await supabase
            .rpc('get_matching_tags', { query_text: query });

        if (error) {
            console.error("Supabase RPC Error:", error);
            // Fallback: Return empty or handle gracefully if function missing
            return NextResponse.json({ tags: [] });
        }

        // Map result [{tag: "name", count: N}] to ["name"]
        const tagList = tags?.map((t: any) => t.tag) || [];

        return NextResponse.json({ tags: tagList });
    } catch (error) {
        console.error("Error fetching tags:", error);
        return NextResponse.json({ error: "Failed to fetch tags" }, { status: 500 });
    }
}
