import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { generateText } from "@/lib/gemini";

// Initialize AI model (assuming geminiModel is exported from lib/gemini)
// If not, we'd initialize it here.

export async function POST(req: Request) {
    try {
        const { content, type, id, authorId } = await req.json();

        if (!content) return NextResponse.json({ safe: true });

        // 1. AI Safety Check
        const prompt = `
      Analyze the following content for medical tourism forum.
      Check for: Hate speech, violence, illegal drug sales, explicit spam, severe medical misinformation causing harm.
      
      Content: "${content.substring(0, 1000)}"
      
      Response format: JSON with boolean "violation" and string "reason".
      Example: {"violation": true, "reason": "Hate speech detected"}
    `;

        let aiResult = { violation: false, reason: "" };

        try {
            const text = await generateText(prompt);
            const cleanedText = (text || "").replace(/```json/g, "").replace(/```/g, "").trim();
            aiResult = JSON.parse(cleanedText);
        } catch (e) {
            console.error("AI Check failed, defaulting to safe:", e);
        }

        // 2. If violation, Flag Content & Notify Admin
        if (aiResult.violation) {
            console.log(`[AI-MOD] Violation detected in ${type} ${id}: ${aiResult.reason}`);

            // Flag content in DB
            let table = '';
            if (type === 'post') table = 'posts';
            else if (type === 'question') table = 'questions';
            else if (type === 'comment') table = 'comments';

            if (table) {
                await supabase.from(table).update({ is_reported: true }).eq('id', id);

                // Create a system report
                await supabase.from('reports').insert({
                    target_type: type,
                    target_id: id,
                    reason: `[AI-AUTO] ${aiResult.reason}`,
                    status: 'pending'
                });
            }

            // TODO: Send Email to Admin (Placeholder)
            // await sendAdminEmail(...) 
            console.log("Mock: Email sent to admin about violation.");
        }

        return NextResponse.json({ checked: true, violation: aiResult.violation });

    } catch (error) {
        console.error("Error in AI automod:", error);
        return NextResponse.json({ error: "Automod failed" }, { status: 500 });
    }
}
