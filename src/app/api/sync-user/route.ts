
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      userEmail,
      userImageUrl,
    } = body;

    console.log("Syncing user to Supabase:", userId);

    // Check if user exists
    const { data: existingUser, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .maybeSingle();

    if (existingUser) {
      // User exists

      // Check if username is missing (legacy or incomplete signup)
      if (!existingUser.username) {
        return NextResponse.json({
          success: true,
          action: "onboarding_required",
          user: existingUser,
          message: "User exists but needs username",
        });
      }

      // Update basic info if needed
      const { data: updatedUser } = await supabaseAdmin
        .from('users')
        .update({
          email: userEmail,
          image_url: userImageUrl
        })
        .eq('clerk_id', userId)
        .select()
        .single();

      return NextResponse.json({
        success: true,
        action: "synced",
        user: updatedUser,
        message: "User synced",
      });
    }

    // Create new user WITHOUT username
    const newUserPayload: {
      clerk_id: string;
      email: string;
      image_url: string;
      role: 'user' | 'admin';
      username: string | null;
    } = {
      clerk_id: userId,
      email: userEmail,
      image_url: userImageUrl,
      role: 'user',
      username: null // Explicitly null to trigger onboarding
    };

    // Special check for monaalmamen@gmail.com
    if (userEmail === 'monaalmamen@gmail.com') {
      newUserPayload.role = 'admin';
    }

    const { data: newUser, error: createError } = await supabaseAdmin
      .from('users')
      .insert(newUserPayload)
      .select()
      .single();

    if (createError) {
      if (createError.code === '42501') {
        console.error("🔴 RLS ERROR: It seems the Supabase Service Key is invalid or missing. Please check your .env.local and ensure SUPABASE_SERVICE_ROLE_KEY is set correctly.");
      }
      console.error("Error creating user:", createError);
      throw createError;
    }

    return NextResponse.json({
      success: true,
      action: "onboarding_required",
      user: newUser,
      message: "User created, onboarding required",
    });

  } catch (error: any) {
    console.error("Error syncing user:", error);
    return NextResponse.json(
      { error: "Failed to sync user: " + (error.message || error) },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: user, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('clerk_id', userId)
      .single();

    if (error || !user) {
      return NextResponse.json({ exists: false, message: "User not found in Supabase" });
    }

    return NextResponse.json({ exists: true, user, message: "User found in Supabase" });
  } catch (error) {
    console.error("Error getting user:", error);
    return NextResponse.json({ error: "Failed to check user" }, { status: 500 });
  }
}
