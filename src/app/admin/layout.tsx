import type { Metadata } from "next";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AdminSidebar } from "./_components/admin-sidebar";
import AdminAIChat from "@/components/AdminAIChat";

export const metadata: Metadata = {
  title: "Medical Tourism Forum - Admin panel",
  description: "Medical Tourism Forum - Admin",
};

export default async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const email = user.emailAddresses[0]?.emailAddress;

  // Allow specific email or check DB role
  let isAuthorized = email === "monaalmamen@gmail.com";

  if (!isAuthorized) {
    const { data: dbUser } = await supabase
      .from("users")
      .select("role")
      .eq("clerk_id", user.id)
      .single();

    if (dbUser?.role === "admin") {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    return (
      <div className="flex h-screen items-center justify-center flex-col">
        <h1 className="text-2xl font-bold text-red-500">Access Denied</h1>
        <p className="mt-2 text-gray-600">You do not have permission to view this page.</p>
        <a href="/" className="mt-4 text-blue-500 hover:underline">Go back home</a>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="flex bg-gray-100 min-h-screen w-full">
        <AdminSidebar />
        <main className="flex-1 overflow-y-auto p-4 w-full">
          {children}
        </main>
        <AdminAIChat />
      </div>
    </SidebarProvider>
  );
}
