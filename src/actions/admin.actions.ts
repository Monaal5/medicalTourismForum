
'use server'

import { supabase } from "@/lib/supabase";
import { revalidatePath } from "next/cache";

export async function addAdminByEmail(formData: FormData) {
    const email = formData.get('email') as string;

    if (!email) return;

    // 1. Find user by email
    const { data: user, error: findError } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

    if (findError || !user) {
        console.error("User not found or error finding user", findError);
        // Ideally pass error back to UI
        return;
    }

    // 2. Update role to admin
    const { error: updateError } = await supabase
        .from('users')
        .update({ role: 'admin' })
        .eq('id', user.id);

    if (updateError) {
        console.error("Failed to update user role", updateError);
        return;
    }

    revalidatePath('/admin/manage-access');
}
