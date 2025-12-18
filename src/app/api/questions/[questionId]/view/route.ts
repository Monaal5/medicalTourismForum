import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(
    req: Request,
    { params }: { params: Promise<{ questionId: string }> }
) {
    try {
        const { questionId } = await params;

        // Fetch current view count
        const { data: question, error: fetchError } = await supabase
            .from('questions')
            .select('view_count')
            .eq('id', questionId)
            .single();

        if (fetchError) {
            console.error("Error fetching question for view increment:", fetchError);
            return NextResponse.json(
                { error: "Question not found" },
                { status: 404 }
            );
        }

        const newCount = (question.view_count || 0) + 1;

        // Update view count
        const { error: updateError } = await supabase
            .from('questions')
            .update({ view_count: newCount })
            .eq('id', questionId);

        if (updateError) {
            console.error("Error updating question view count:", updateError);
            return NextResponse.json(
                { error: "Failed to update view count" },
                { status: 500 }
            );
        }

        return NextResponse.json({ success: true, viewCount: newCount });
    } catch (error) {
        console.error("Error in view increment API:", error);
        return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
        );
    }
}
