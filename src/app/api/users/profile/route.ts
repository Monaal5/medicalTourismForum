
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await request.json();
        const { bio, education, location, socialLinks } = body;

        // Update user based on Clerk ID
        const { data, error } = await supabase
            .from('users')
            .update({
                bio,
                education,
                location,
                social_links: socialLinks
            })
            .eq('clerk_id', userId)
            .select()
            .single();

        if (error) {
            console.error("Error updating profile:", error);
            throw error;
        }

        return NextResponse.json({ success: true, user: data });

    } catch (error: any) {
        console.error("Profile update error:", error);
        return NextResponse.json(
            { error: "Failed to update profile: " + error.message },
            { status: 500 }
        );
    }
}
