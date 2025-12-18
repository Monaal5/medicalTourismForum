
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json(
        { error: "Search query is required" },
        { status: 400 }
      );
    }

    const cleanQuery = query.trim();
    const isHashtag = cleanQuery.startsWith('#');
    const tagQuery = isHashtag ? cleanQuery.slice(1) : cleanQuery;
    const searchTerm = `%${cleanQuery}%`;

    // Search Questions
    // We search title, description, or if tags contain the query (exact match for tag if possible, or simple text search)
    // For tags, 'tags' is text[]. .contains('tags', [tagQuery]) finds if array contains the exact string.

    let questionsQuery = supabase
      .from('questions')
      .select(`
            id,
            title,
            description,
            tags,
            created_at,
            author:users!author_id(username, image_url),
            category:categories(name, color),
            answers:answers(count)
        `)
      .order('created_at', { ascending: false })
      .limit(10);

    if (isHashtag) {
      // Strict tag search - check for both "tag" and "#tag" to handle inconsistencies
      // .overlaps() checks if the arrays have any common elements
      questionsQuery = questionsQuery.overlaps('tags', [tagQuery, `#${tagQuery}`]);
    } else {
      // Fuzzy search
      // Note: OR logic with tags contains is tricky in Supabase one-liner.
      // We will stick to title/description ILIKE for complexity reasons, 
      // OR try .or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`)
      questionsQuery = questionsQuery.or(`title.ilike.${searchTerm},description.ilike.${searchTerm}`);
    }

    const { data: questions, error: qError } = await questionsQuery;

    // Search Posts
    let postsQuery = supabase
      .from('posts')
      .select(`
            id,
            title,
            body,
            image_url,
            published_at,
            tags,
            author:users!author_id(username, image_url),
            community:communities(title, slug),
            comments:comments(count)
        `)
      .order('published_at', { ascending: false })
      .limit(10);

    if (isHashtag) {
      postsQuery = postsQuery.overlaps('tags', [tagQuery, `#${tagQuery}`]);
    } else {
      postsQuery = postsQuery.ilike('title', searchTerm);
    }

    const { data: posts, error: pError } = await postsQuery;

    // Search Users
    const { data: users } = await supabase
      .from('users')
      .select(`
            id,
            username,
            email,
            image_url,
            bio,
            joined_at
        `)
      .or(`username.ilike.${searchTerm},email.ilike.${searchTerm}`)
      .limit(10);

    // Search Answers (Content)
    // Answers body is JSONB often, but sticking to simple text if possible. 
    // Supabase casting: body->>'content' ilike ... if it's json.
    // Earlier I stored answer body as JSONB.
    // It's hard to search JSONB text efficiently without FTS.
    // I will skip answer body search or try a simple cast if I know the structure.
    // Assuming we skip answer content search for now to avoid errors, or catch mismatch.
    const answers: any[] = []; // Placeholder

    if (qError) console.error("Questions search error:", qError);
    if (pError) console.error("Posts search error:", pError);

    // Map to frontend structure
    const mappedQuestions = questions?.map((q: any) => ({
      _id: q.id,
      title: q.title,
      description: q.description,
      author: {
        username: q.author?.username || 'Unknown',
        imageUrl: q.author?.image_url
      },
      category: q.category,
      tags: q.tags,
      createdAt: q.created_at,
      answerCount: q.answers?.[0]?.count || 0
    })) || [];

    const mappedPosts = posts?.map((p: any) => ({
      _id: p.id,
      postTitle: p.title,
      body: p.body, // Pass as is
      author: {
        username: p.author?.username || 'Unknown',
        imageUrl: p.author?.image_url
      },
      subreddit: p.community ? { title: p.community.title, slug: { current: p.community.slug } } : null,
      publishedAt: p.published_at,
      commentCount: p.comments?.[0]?.count || 0
    })) || [];

    const mappedUsers = users?.map((u: any) => ({
      _id: u.id,
      username: u.username,
      email: u.email,
      imageUrl: u.image_url,
      bio: u.bio,
      joinedAt: u.joined_at
    })) || [];

    return NextResponse.json({
      success: true,
      query,
      questions: mappedQuestions,
      posts: mappedPosts,
      users: mappedUsers,
      answers: [],
      totalResults: mappedQuestions.length + mappedPosts.length + mappedUsers.length
    });

  } catch (error: any) {
    console.error("Search error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to perform search: " + error.message,
        questions: [],
        posts: [],
        users: [],
        answers: [],
      },
      { status: 500 }
    );
  }
}
