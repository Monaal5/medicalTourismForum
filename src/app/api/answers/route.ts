
import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { createNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("=== API POST /api/answers ===");
    console.log("Received answer request body:", body);

    const {
      content,
      questionId,
      userId,
    } = body;

    if (!content || !questionId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // 1. Get User
    const { data: user } = await supabase.from('users').select('id, username').eq('clerk_id', userId).single();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // 2. Create Answer (Assuming body is just text for now, mapping to jsonb as simple text or structure)
    // Structure: body -> jsonb. Frontend sends text.
    // Let's store as simple content for now or match Tiptap structure if frontend sends it.
    // The previous code created a block structure. To keep it simple for now, I will store raw text 
    // OR create a simple block if needed.
    // Frontend component `renderAnswerContent` expects `content` array with blocks.
    // So I must mimic that structure.

    const answerContent = [
      {
        _type: "block",
        children: [
          {
            _type: "span",
            text: content,
          },
        ],
      },
    ];

    const { data: answer, error } = await supabase
      .from('answers')
      .insert({
        question_id: questionId,
        author_id: user.id,
        body: answerContent, // Storing as JSONB
        is_accepted: false
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase insert error:", error);
      throw error;
    }

    console.log("✓ Answer created successfully:", answer.id);

    // 3. Update Question & Notify Author
    try {
      const { data: question } = await supabase.from('questions').select('author_id').eq('id', questionId).single();
      if (question && question.author_id) {
        await createNotification({
          recipientId: question.author_id,
          senderId: user.id,
          type: 'answer',
          questionId: questionId,
          answerId: answer.id
        });
      }
    } catch (notifError) {
      console.error("Error creating notification:", notifError);
    }

    return NextResponse.json({
      success: true,
      answer: { ...answer, _id: answer.id }, // Map for frontend
      message: "Answer created successfully"
    });
  } catch (error: any) {
    console.error("❌ Error creating answer:", error);
    return NextResponse.json(
      {
        error: "Failed to create answer: " + error.message,
        details: error.message
      },
      { status: 500 },
    );
  }
}
