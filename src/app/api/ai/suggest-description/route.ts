import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { title, currentBody } = await req.json();

        if (!title) {
            return NextResponse.json(
                { error: "Title is required for suggestion" },
                { status: 400 }
            );
        }

        const prompt = `
      You are an assistant for a medical tourism forum. A user is writing a post.
      Title: "${title}"
      Current Body Draft: "${currentBody || ""}"

      Please generate a comprehensive and helpful post description (body) for this topic. 
      It should be polite, detailed, and ask relevant questions or share relevant information typical for medical tourism discussions.
      If the user provided a draft, expand on it. If not, create a good starting point based on the title.
      Keep it under 300 words. Format with paragraphs.
      Do not include "Subject:" or "Title:" in the output, just the body text.
    `;

        const text = await generateText(prompt);

        return NextResponse.json({ suggestion: text });
    } catch (error) {
        console.error("Error generating description:", error);
        return NextResponse.json(
            { error: "Failed to generate description" },
            { status: 500 }
        );
    }
}
