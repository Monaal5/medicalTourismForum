import { NextResponse } from "next/server";
import { adminClient } from "@/sanity/lib/adminClient";

export async function GET() {
    try {
        const typesToDelete = ["question", "post", "answer", "comment"];
        console.log(`Deleting all documents of types: ${typesToDelete.join(", ")}`);

        // Fetch IDs to delete
        const query = `*[_type in $types]._id`;
        const ids = await adminClient.fetch(query, { types: typesToDelete });

        console.log(`Found ${ids.length} documents to delete.`);

        if (ids.length === 0) {
            return NextResponse.json({ message: "No documents found to delete." });
        }

        // Delete in batches (Sanity transactions have a limit, usually around 1000 ops, but let's be safe)
        // If there are many, we might need multiple transactions.
        // For now, assuming < 1000 for a dev environment.

        const transaction = adminClient.transaction();
        ids.forEach((id: string) => {
            transaction.delete(id);
        });

        await transaction.commit();
        console.log("Deletion complete.");

        return NextResponse.json({
            success: true,
            message: `Deleted ${ids.length} documents.`,
            deletedIds: ids,
        });
    } catch (error) {
        console.error("Error deleting documents:", error);
        return NextResponse.json(
            { success: false, error: "Failed to delete documents", details: error },
            { status: 500 }
        );
    }
}
