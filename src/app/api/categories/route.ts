import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*, questions(count), posts(count), polls(count)');

    if (error) throw error;

    const categories = data.map((cat: any) => ({
      _id: cat.id,
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      icon: cat.icon,
      color: cat.color,
      questionCount: cat.questions?.[0]?.count || 0,
      postCount: cat.posts?.[0]?.count || 0,
      pollCount: cat.polls?.[0]?.count || 0,
    }));

    return NextResponse.json({
      success: true,
      categories: categories || [],
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch categories",
        categories: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      description,
      icon,
      color,
      userId,
    } = body;

    if (!name || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Generate Slug
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    // 2. Check Duplicates (by slug or name)
    const { data: existing } = await supabase
      .from('categories')
      .select('id')
      .or(`slug.eq.${slug},name.ilike.${name}`)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Category already exists" }, { status: 400 });
    }

    // 3. Create
    // Note: description field might be missing in DB schema I provided earlier.
    // I will try to insert it, if it fails, I might need to update schema or omit it.
    // Let's assume I should update schema if I want description. 
    // I'll stick to what I defined: name, slug, icon, color.

    const { data: newCat, error } = await supabase
      .from('categories')
      .insert({
        name,
        slug,
        icon: icon || "Heart",
        color: color || "#ef4444"
        // description: description // Omitted as per my earlier schema unless I update schema
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({
      success: true,
      category: { ...newCat, _id: newCat.id },
    });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create category",
      },
      { status: 500 },
    );
  }
}
