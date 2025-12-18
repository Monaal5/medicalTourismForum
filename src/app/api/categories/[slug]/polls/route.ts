import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";
import { supabase } from "@/lib/supabase";

export async function GET(
    req: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    try {
        const { slug } = await params;

        // Fetch category from Supabase to get the correct UUID
        const { data: category, error: catError } = await supabase
            .from("categories")
            .select("id")
            .eq("slug", slug)
            .single();

        if (catError || !category) {
            console.log("Category not found in Supabase:", slug);
            return NextResponse.json({ polls: [] });
        }

        // Fetch polls for this category from Supabase
        const { data: polls, error } = await supabase
            .from("polls")
            .select("*")
            .eq("category_id", category.id)
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Error fetching polls:", error);
            return NextResponse.json({ polls: [] });
        }

        return NextResponse.json({ polls: polls || [] });
    } catch (error) {
        console.error("Error fetching polls:", error);
        return NextResponse.json({ polls: [] });
    }
}
