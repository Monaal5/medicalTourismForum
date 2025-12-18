
import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> },
) {
  try {
    const { userId } = await params;

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 },
      );
    }

    // Determine if we search by clerk_id or internal uuid
    let query = supabase.from('users').select('*');

    // Clerk IDs usually start with 'user_'
    // UUIDs are 36 chars with dashes.

    if (userId.startsWith('user_')) {
      query = query.eq('clerk_id', userId);
    } else {
      // Try as UUID
      // Simple check or try-catch
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (uuidRegex.test(userId)) {
        query = query.eq('id', userId);
      } else {
        // Fallback: maybe it's a username query disguised as ID? 
        // Logic in Sanity was _id or clerkId.
        // If not UUID and not ClerkID, probably won't match either in strict sense.
        // Let's just try clerkId to be safe to avoid UUID casting errors
        query = query.eq('clerk_id', userId);
      }
    }

    const { data: user, error } = await query.single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map to response format if expected
    return NextResponse.json({
      _id: user.id,
      username: user.username,
      email: user.email,
      imageUrl: user.image_url,
      bio: user.bio,
      joinedAt: user.joined_at,
      clerkId: user.clerk_id
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return NextResponse.json(
      { error: "Failed to fetch user" },
      { status: 500 },
    );
  }
}
