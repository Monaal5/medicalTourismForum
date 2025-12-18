
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const { questionId } = await params;

    console.log('=== API GET /api/questions/[questionId] ===');
    console.log('Question ID:', questionId);

    // Fetch Question
    const { data: question, error } = await supabase
      .from('questions')
      .select(`
            *,
            author:users!author_id(id, username, image_url, clerk_id),
            category:categories(id, name, slug)
        `)
      .eq('id', questionId)
      .single();

    if (error || !question) {
      console.log("Question not found db error:", error);
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // Get Answers
    const { data: answers, error: answerError } = await supabase
      .from('answers')
      .select(`
            *,
            author:users(id, username, image_url, clerk_id)
        `)
      .eq('question_id', questionId)
      .order('created_at', { ascending: false });

    const mapUser = (u: any) => u ? ({
      _id: u.id,
      username: u.username,
      imageUrl: u.image_url,
      clerkId: u.clerk_id
    }) : null;

    const mappedQuestion = {
      _id: question.id,
      title: question.title,
      description: question.description,
      tags: question.tags,
      createdAt: question.created_at,
      updatedAt: question.created_at, // or updated_at if exists
      author: mapUser(Array.isArray(question.author) ? question.author[0] : question.author),
      category: question.category,
      answerCount: answers?.length || 0,
      viewCount: question.view_count || 0,
      answers: answers?.map((a: any) => ({
        _id: a.id,
        content: a.body?.content || a.body || "",
        createdAt: a.created_at,
        author: mapUser(Array.isArray(a.author) ? a.author[0] : a.author),
        isAccepted: a.is_accepted
      })) || []
    };

    return NextResponse.json({
      success: true,
      question: mappedQuestion
    });

  } catch (error: any) {
    console.error("Error fetching question:", error);
    return NextResponse.json(
      { error: "Failed to fetch question: " + error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ questionId: string }> }
) {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { questionId } = await params;

    // 1. Fetch Question to check owner
    const { data: question, error } = await supabase
      .from('questions')
      .select('author_id, author:users!author_id(clerk_id)')
      .eq('id', questionId)
      .single();

    if (error || !question) {
      return NextResponse.json({ error: "Question not found" }, { status: 404 });
    }

    // 2. Check Ownership (compare Clerk ID)
    const author = Array.isArray(question.author) ? question.author[0] : question.author;
    const isOwner = author?.clerk_id === user.id;
    // Also allow admin? (user email check)
    const isAdmin = user.emailAddresses[0]?.emailAddress === 'monaalmamen@gmail.com';

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Unauthorized: You can only delete your own questions" }, { status: 403 });
    }

    // 3. Delete
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .eq('id', questionId);

    if (deleteError) throw deleteError;

    return NextResponse.json({ success: true, message: "Question deleted successfully" });

  } catch (error: any) {
    console.error("Error deleting question:", error);
    return NextResponse.json({ error: "Failed to delete question: " + error.message }, { status: 500 });
  }
}
