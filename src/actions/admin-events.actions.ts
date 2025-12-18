"use server";
import { supabaseAdmin as supabase } from "@/lib/supabase";
import { currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

async function checkAdmin() {
    const user = await currentUser();
    if (!user) throw new Error("Unauthorized");
    const email = user.emailAddresses[0]?.emailAddress;
    // Hardcoded super admin fallback
    if (email === "monaalmamen@gmail.com") return true;

    // Check DB role
    const { data: dbUser } = await supabase.from("users").select("role").eq("clerk_id", user.id).single();
    if (dbUser?.role !== "admin") throw new Error("Unauthorized");
}

export async function createEvent(formData: FormData) {
    await checkAdmin();
    const title = formData.get("title") as string;
    const linkUrl = formData.get("linkUrl") as string;
    const imageFile = formData.get("image") as File;

    if (!imageFile) throw new Error("Image is required");

    // Upload Image
    const filename = `${Date.now()}-${imageFile.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from("event-images")
        .upload(filename, imageFile, { upsert: false });

    if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error(`Upload failed: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage.from("event-images").getPublicUrl(filename);

    // Insert Event
    const { error: dbError } = await supabase.from("events").insert({
        title,
        link_url: linkUrl,
        image_url: publicUrl,
        is_active: true
    });

    if (dbError) throw new Error(dbError.message);

    revalidatePath("/admin/events");
    revalidatePath("/"); // Update home popup
    return { success: true };
}

export async function deleteEvent(id: string) {
    await checkAdmin();
    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true };
}

export async function toggleEventStatus(id: string, currentStatus: boolean) {
    await checkAdmin();
    const { error } = await supabase.from("events").update({ is_active: !currentStatus }).eq("id", id);
    if (error) throw error;
    revalidatePath("/admin/events");
    revalidatePath("/");
    return { success: true };
}
