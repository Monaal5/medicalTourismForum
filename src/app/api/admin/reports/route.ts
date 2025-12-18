import { NextResponse } from "next/server";
import { supabaseAdmin as supabase } from "@/lib/supabase";

export async function GET() {
    try {
        const { data: reports, error } = await supabase
            .from('reports')
            .select('*')
            .eq('status', 'pending')
            .order('created_at', { ascending: false });

        if (error) throw error;

        return NextResponse.json({ reports });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch reports" }, { status: 500 });
    }
}
