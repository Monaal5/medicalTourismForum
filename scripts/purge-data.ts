
import { createClient } from 'next-sanity';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-19',
    token: process.env.SANITY_API_ADMIN_TOKEN,
    useCdn: false,
};

if (!config.token) {
    console.error("Missing SANITY_API_ADMIN_TOKEN");
    process.exit(1);
}

const client = createClient(config);

async function purgeData() {
    try {
        const typesToDelete = ["user", "subreddit", "question", "post", "answer", "comment"];

        console.log("Starting purge via script...");
        console.log("Configuration:", { ...config, token: "***" });

        // Fetch all documents of these types
        const documents = await client.fetch(
            `*[_type in $types]{_id}`,
            { types: typesToDelete }
        );

        console.log(`Found ${documents.length} documents to delete.`);

        if (documents.length === 0) {
            console.log("Nothing to delete.");
            return;
        }

        const transaction = client.transaction();

        documents.forEach((doc: any) => {
            transaction.delete(doc._id);
        });

        const result = await transaction.commit();
        console.log("Purge complete.", result);

    } catch (error) {
        console.error("Purge error:", error);
        process.exit(1);
    }
}

purgeData();
