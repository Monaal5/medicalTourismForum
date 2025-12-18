
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { extractHashtags } from "@/lib/hashtags";

// Helper to map (duplicate of queries.ts one if not exported)
function mapQuestion(question: any) {
  return {
    _id: question.id,
    title: question.title,
    description: question.description,
    author: question.author || { username: 'Unknown', imageUrl: '' },
    category: question.category,
    image: null,
    tags: question.tags,
    isAnswered: question.is_answered,
    isDeleted: false,
    createdAt: question.created_at,
    answerCount: question.answers?.[0]?.count || 0,
    voteCount: 0,
    topAnswer: null
  };
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const unanswered = searchParams.get("unanswered");

    console.log("=== QUESTIONS API GET (Supabase) ===");
    console.log("Category filter:", category); // category ID in Sanity, likely ID in Supabase too
    console.log("Unanswered filter:", unanswered);

    let query = supabase
      .from('questions')
      .select(`
            id,
            title,
            description,
            tags,
            is_answered,
            created_at,
            view_count,
            author:users!author_id (username, image_url, clerk_id),
            category:categories (id, name, icon, color),
            answers:answers(count)
        `)
      .order('created_at', { ascending: false })
      .limit(50);

    if (category) {
      // category param might be ID. Sanity used _ref.
      // Assuming frontend passes ID.
      query = query.eq('category_id', category);
    }

    if (unanswered === "true") {
      query = query.eq('is_answered', false);
      // Note: is_answered flag is manual. 
      // Sanity query checked count > 0. 
      // Supabase approach: filtering by related count is harder in one go without raw SQL or RPC.
      // But we have is_answered column which is a good proxy if maintained.
      // Alternatively, fetch and filter in JS (expensive) or use !inner join on answers.
      // Let's stick to is_answered column for now.
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching questions:", error);
      throw error;
    }

    const questions = data.map(mapQuestion);

    return NextResponse.json({
      success: true,
      questions: questions || [],
    });
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch questions",
        questions: [],
      },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("Received question request body:", body);

    const {
      title,
      description,
      categoryId,
      tags,
      userId,
      userEmail,
      userFullName,
      userImageUrl,
    } = body;

    if (!title || !userId) {
      console.log("Missing required fields:", { title, userId });
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Get User ID (internal UUID) from Clerk ID
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, username')
      .eq('clerk_id', userId)
      .single();

    if (userError || !user) {
      // User should exist by now due to sync, but if not we could auto-create?
      // Better to return error as sync should handle creation.
      console.error("User not found for question creation:", userId);
      return NextResponse.json({ error: "User not found. Please refresh." }, { status: 404 });
    }

    // 2. Prepare Tags
    const extractedTags = [
      ...extractHashtags(title),
      ...extractHashtags(description || ""),
    ];
    let finalTags: string[] = [];
    if (tags && tags.length > 0) {
      finalTags = [...new Set([...tags, ...extractedTags])];
    } else if (extractedTags.length > 0) {
      finalTags = extractedTags;
    }

    // 3. Insert Question
    const { data: newQuestion, error: createError } = await supabase
      .from('questions')
      .insert({
        title,
        description,
        author_id: user.id,
        category_id: categoryId, // Assuming this is UUID
        tags: finalTags,
        is_answered: false,
        is_anonymous: body.isAnonymous || false
      })
      .select()
      .single();

    if (createError) {
      console.error("Error creating question:", createError);
      throw createError;
    }

    console.log("Question created successfully:", newQuestion.id);

    return NextResponse.json({ question: { _id: newQuestion.id } }); // Return format expected by frontend
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 },
    );
  }
}
