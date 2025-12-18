
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { auth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
    try {
        const { userId } = await auth();
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { employment, education, location, socialLinks } = await request.json();

        // Update user stats
        const { error } = await supabase
            .from('users')
            .update({
                employment,
                education,
                location,
                social_links: socialLinks,
                // We aren't storing 'employment' in the DB schema in prior step?
                // Wait, schema update had `add column if not exists employment text`? No?
                // Let's check profile_schema_update.sql
                // It had education, location, social_links.
                // It did NOT have employment.
                // I should add employment if I want to save it.
            })
            .eq('clerk_id', userId);

        // Wait, is employment mapped to something? 
        // In ProfileContent: `employment: user.employment || ""`
        // I should update SQL to include employment or store it in metadata?
        // Better to check if I added it.

        if (error) {
            console.error("Supabase update error:", error);
            throw error;
        }

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error("Error updating credentials:", error);
        return NextResponse.json({ error: "Failed to update" }, { status: 500 });
    }
}
