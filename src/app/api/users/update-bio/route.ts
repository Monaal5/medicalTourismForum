
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { bio } = await request.json();

        const { error } = await supabase
            .from('users')
            .update({ bio })
            .eq('clerk_id', userId);

        if (error) {
            console.error("Error updating bio:", error);
            throw error;
        }

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error("Bio update error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
