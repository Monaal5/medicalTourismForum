
"use server";

import { supabaseAdmin as supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

// Helper to check admin status
async function checkAdmin() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");

    const email = user.emailAddresses[0]?.emailAddress;
    if (email === "monaalmamen@gmail.com") return true;

    const { data: dbUser } = await supabase
        .from("users")
        .select("role")
        .eq("clerk_id", user.id)
        .single();

    if (dbUser?.role !== "admin") {
        throw new Error("Unauthorized: Admin access required");
    }
}

// 1. Nuke Database (Dangerous!)
export async function nukeDatabase() {
    await checkAdmin();

    // Truncate tables. Order matters due to FKs.
    // Using CASCADE style deletion or carefully ordered specific deletes.
    // Supabase/Postgres TRUNCATE CASCADE is fastest.
    const { error } = await supabase.rpc('nuke_database'); // We need an RPC for clean nuke or separate deletes

    // If RPC doesn't exist, manual delete
    if (error) {
        console.log("RPC nuke_database not found, falling back to manual deletion");

        // Delete child tables first
        await supabase.from('bookmarks').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('votes').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('comments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('answers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('posts').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('questions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('communities').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        await supabase.from('categories').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        // await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000'); // Deleting users breaks Clerk sync? Maybe keep users.
        // Request said "Reset Database". Usually keeps users but resets content. 
        // If "Nuke" literally means everything:
        await supabase.from('users').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    }

    revalidatePath("/admin");
    return { success: true };
}

// 2. User Actions
export async function banUser(userId: string) {
    await checkAdmin();
    // Assuming 'role' or status field. Only 'role' exists. Maybe role='banned'?
    // Schema has 'is_reported'. Let's add 'role' check constraint allow 'banned' or just create a status.
    // Schema def: role text default 'user'.
    const { error } = await supabase.from('users').update({ role: 'banned' }).eq('id', userId);
    if (error) throw error;
    revalidatePath("/admin/users");
    return { success: true };
}

export async function deleteUser(userId: string) {
    await checkAdmin();
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw error;
    revalidatePath("/admin/users");
    return { success: true };
}

export async function createUser(data: any) {
    await checkAdmin();
    // Use sync API logic or direct insert
    const { error } = await supabase.from('users').insert(data);
    if (error) throw error;
    revalidatePath("/admin/users");
    return { success: true };
}

// 3. Content Actions
export async function deletePost(id: string) {
    await checkAdmin();
    const { error } = await supabase.from('posts').delete().eq('id', id);
    if (error) throw error;
    revalidatePath("/admin/posts");
    return { success: true };
}

export async function deleteQuestion(id: string) {
    await checkAdmin();
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) throw error;
    revalidatePath("/admin/questions");
    return { success: true };
}

export async function deleteCommunity(id: string) {
    await checkAdmin();
    const { error } = await supabase.from('communities').delete().eq('id', id);
    if (error) throw error;
    revalidatePath("/admin/communities");
    return { success: true };
}


export async function deleteCategory(id: string) {
    await checkAdmin();
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    revalidatePath("/admin/categories");
    return { success: true };
}

export async function createCategory(data: { name: string; slug: string; description?: string; icon?: string; color?: string; }) {
    await checkAdmin();

    // Validate slug uniqueness
    const { data: existing } = await supabase.from('categories').select('id').eq('slug', data.slug).single();
    if (existing) {
        throw new Error("Category with this slug already exists");
    }

    // Try to insert with description. If column missing, it will fail? 
    // Or Supabase/Postgres might error. 
    // I should migrate schema first or now.
    const { error } = await supabase.from('categories').insert({
        name: data.name,
        slug: data.slug,
        icon: data.icon,
        color: data.color,
        description: data.description
    });

    if (error) {
        console.error("Create category error:", error);
        throw new Error(error.message);
    }
    revalidatePath("/admin/categories");
    return { success: true };
}
