
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(req: NextRequest) {
    try {
        const { userId } = getAuth(req);
        if (!userId) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { filename, contentType } = await req.json();

        if (!filename || !contentType) {
            return NextResponse.json(
                { error: "Filename and content type are required" },
                { status: 400 }
            );
        }

        // Generate a unique file path
        const fileExt = filename.split(".").pop();
        const uniqueId = Math.random().toString(36).substring(2, 12);
        const path = `uploads/${userId}/${Date.now()}-${uniqueId}.${fileExt}`;

        // Get signed upload URL from Supabase
        // Ensure 'post-images' bucket exists and is public
        const { data, error } = await supabaseAdmin.storage
            .from("post-images")
            .createSignedUploadUrl(path);

        if (error) {
            console.error("Error creating signed upload URL:", error);
            return NextResponse.json({ error: error.message }, { status: 500 });
        }

        // Construct the public URL (assuming the bucket is public)
        const { data: publicUrlData } = supabaseAdmin.storage
            .from("post-images")
            .getPublicUrl(path);

        return NextResponse.json({
            signedUrl: data.signedUrl,
            path: data.path, // token is included in signedUrl
            publicUrl: publicUrlData.publicUrl
        });

    } catch (error: any) {
        console.error("Error in upload sign route:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
