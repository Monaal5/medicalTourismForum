import { NextResponse } from "next/server";

export async function POST(request: Request) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Here you would typically integrate with a newsletter provider like Mailchimp, ConvertKit, etc.
        // For now, we'll just log it.
        console.log("Newsletter subscription:", email);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error subscribing to newsletter:", error);
        return NextResponse.json(
            { error: "Failed to subscribe" },
            { status: 500 }
        );
    }
}
