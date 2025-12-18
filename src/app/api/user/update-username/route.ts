
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { username } = body;

        if (!username || username.length < 3) {
            return NextResponse.json({ error: "Invalid username" }, { status: 400 });
        }

        // Check if username is taken
        const { data: existingUser } = await supabase
            .from('users')
            .select('id')
            .eq('username', username)
            .single();

        if (existingUser) {
            return NextResponse.json({ error: "Username already taken" }, { status: 409 });
        }

        // Update user
        const { error: updateError } = await supabase
            .from('users')
            .update({ username })
            .eq('clerk_id', userId);

        if (updateError) {
            throw updateError;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
