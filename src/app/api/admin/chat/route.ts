import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { generateText } from "@/lib/gemini";

export async function POST(req: Request) {
    try {
        const { message } = await req.json();

        // 1. Fetch Context Data (Stats, recent reports, etc.)
        const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });
        const { count: postCount } = await supabase.from('posts').select('*', { count: 'exact', head: true });
        const { count: reportCount } = await supabase.from('reports').select('*', { count: 'exact', head: true }).eq('status', 'pending');

        const context = `
      System Context:
      - Total Users: ${userCount}
      - Total Posts: ${postCount}
      - Pending Reports: ${reportCount}
    `;

        // 2. Handle specific queries (e.g., "Tell me about user [username]")
        let specificData = "";
        const lowerMsg = message.toLowerCase();

        if (lowerMsg.includes("user") || lowerMsg.includes("who is")) {
            // Attempt to extract username: look for words after "user", "about", "is"
            const words = message.split(' ');
            let potentialUser = "";

            // Simple heuristics
            if (lowerMsg.includes("about user")) potentialUser = words[words.indexOf("user") + 1];
            else if (lowerMsg.includes("about")) potentialUser = words[words.indexOf("about") + 1];
            else if (lowerMsg.includes("who is")) potentialUser = words[words.indexOf("is") + 1];

            // Remove punctuation
            if (potentialUser) potentialUser = potentialUser.replace(/[?.,]/g, '');

            if (potentialUser) {
                const { data: user } = await supabase.from('users').select('*').ilike('username', `%${potentialUser}%`).maybeSingle();

                if (user) {
                    specificData += `User Details: Name: ${user.username}, Role: ${user.role}, Reputation: ${user.reputation}, Joined: ${new Date(user.joined_at).toDateString()}. `;

                    // Fetch recent posts
                    const { data: posts } = await supabase.from('posts').select('title, created_at').eq('author_id', user.id).order('created_at', { ascending: false }).limit(3);
                    if (posts && posts.length > 0) {
                        specificData += `Recent posts by this user: ${posts.map((p: any) => `"${p.title}"`).join(", ")}.`;
                    } else {
                        specificData += `No recent posts found for this user.`;
                    }
                } else {
                    specificData += `No user found matching "${potentialUser}".`;
                }
            }
        }

        const prompt = `
      You are an AI assistant for the Admin Dashboard of a Medical Tourism Forum.
      Your goal is to help the admin manage the community.
      
      Current Stats:
      ${context}

      Specific Data Loaded:
      ${specificData}

      User Query: "${message}"

      Provide a helpful, concise response. Do not invent data if you don't have it.
    `;

        const result = await generateText(prompt);
        const reply = result || "";

        return NextResponse.json({ reply });

    } catch (error) {
        console.error("Admin Chat Error:", error);
        return NextResponse.json({ reply: "I'm having trouble accessing the server data right now." });
    }
}
