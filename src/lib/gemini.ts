import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
    console.warn("GEMINI_API_KEY is not defined in environment variables.");
}

export const aiClient = new GoogleGenAI({ apiKey: apiKey || "" });

// Helper to match usage in API routes but using the new SDK
export async function generateText(prompt: string, systemInstruction?: string) {
    try {
        // Construct prompt with system instruction if provided, as the SDK/Model might behave better with it inline 
        // or we check if config supports it. 
        let fullPrompt = prompt;
        if (systemInstruction) {
            fullPrompt = `System: ${systemInstruction}\n\nUser: ${prompt}`;
        }

        // Try gemini-2.5-flash as requested
        const response = await aiClient.models.generateContent({
            model: "gemini-2.5-flash",
            contents: fullPrompt,
        });

        return response.text || "";
    } catch (e: any) {
        console.warn("Gemini 2.5 failed, trying fallback to 2.0-flash-exp:", e.message);
        try {
            const response = await aiClient.models.generateContent({
                model: "gemini-2.0-flash-exp",
                contents: prompt, // Simple fallback
            });
            return response.text || "";
        } catch (e2: any) {
            console.warn("Gemini 2.0 failed, trying gemini-1.5-flash:", e2.message);
            try {
                const response = await aiClient.models.generateContent({
                    model: "gemini-1.5-flash",
                    contents: prompt,
                });
                return response.text || "";
            } catch (e3: any) {
                console.error("All Gemini models failed:", e3);
                return "";
            }
        }
    }
}

// Keep a 'model' export for backward compatibility if I can, but the API is different.
// I will remove 'model' export and force update of consumers to use 'generateText'.
