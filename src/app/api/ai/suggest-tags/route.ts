import { NextResponse } from "next/server";
import { generateText } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { content, title } = await req.json();

        if (!content && !title) {
            return NextResponse.json(
                { error: "Content or title is required" },
                { status: 400 }
            );
        }

        const prompt = `
      Analyze the following medical tourism forum post and suggest 5-7 relevant tags.
      Return ONLY a JSON array of strings, e.g., ["dental", "turkey", "implants"].
      Do not include "markdown" formatting or explanations.
      
      Title: ${title}
      Body: ${content}
    `;

        const text = await generateText(prompt);

        // Clean up response if it contains markdown code blocks
        const cleanedText = text.replace(/```json/g, "").replace(/```/g, "").trim();

        let tags: string[] = [];
        try {
            tags = JSON.parse(cleanedText);
        } catch (e) {
            console.error("Failed to parse Gemini response:", text);
            // Fallback: split by commas if not valid JSON
            tags = cleanedText.split(",").map(t => t.trim()).filter(Boolean);
        }

        return NextResponse.json({ tags });
    } catch (error) {
        console.error("Error generating tags:", error);
        return NextResponse.json(
            { error: "Failed to generate tags" },
            { status: 500 }
        );
    }
}
