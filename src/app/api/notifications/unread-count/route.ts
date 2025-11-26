import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json(
                { error: "Missing userId" },
                { status: 400 }
            );
        }

        const query = `count(*[_type == "notification" && recipient._ref == "${userId}" && !read])`;

        const count = await adminClient.fetch(query);

        return NextResponse.json({
            success: true,
            count,
        });
    } catch (error) {
        console.error("Error fetching unread count:", error);
        return NextResponse.json(
            { error: "Failed to fetch unread count" },
            { status: 500 }
        );
    }
}
