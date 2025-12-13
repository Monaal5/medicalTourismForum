
const { createClient } = require('@sanity/client');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    dotenv.config({ path: envPath });
    console.log("Loaded .env.local");
} else {
    console.log("Could not find .env.local");
}

const config = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-19',
    token: process.env.SANITY_API_ADMIN_TOKEN,
    useCdn: false,
};

console.log("Project ID:", config.projectId);
console.log("Dataset:", config.dataset);
console.log("Token Present:", !!config.token);

if (!config.token) {
    console.error("Missing SANITY_API_ADMIN_TOKEN");
    process.exit(1);
}

const client = createClient(config);

async function purgeData() {
    try {
        const typesToDelete = ["user", "subreddit", "question", "post", "answer", "comment"];

        console.log("Starting purge...");

        // Fetch all documents of these types
        const documents = await client.fetch(
            `*[_type in $types]{_id, _type}`,
            { types: typesToDelete }
        );

        console.log(`Found ${documents.length} documents to delete.`);

        if (documents.length === 0) {
            console.log("Nothing to delete.");
            return;
        }

        const transaction = client.transaction();

        documents.forEach((doc) => {
            console.log(`Deleting ${doc._type}: ${doc._id}`);
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
