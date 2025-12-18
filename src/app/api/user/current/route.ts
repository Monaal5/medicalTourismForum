
import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Map to Sanity-like structure for now to keep frontend compatible
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
    console.error('API route: Error fetching current user:', error);
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
