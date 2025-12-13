
import { createClient } from '@sanity/client';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log("Starting purge script (ESM)...");

// Manually parse .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envVars = {};

if (fs.existsSync(envPath)) {
    console.log("Found .env.local");
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
        const match = line.match(/^([^=]+)=(.*)$/);
        if (match) {
            const key = match[1].trim();
            let value = match[2].trim();
            // Remove quotes if present
            if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
                value = value.slice(1, -1);
            }
            envVars[key] = value;
        }
    });
} else {
    console.log("ERROR: .env.local not found!");
    process.exit(1);
}

const config = {
    projectId: envVars.NEXT_PUBLIC_SANITY_PROJECT_ID,
    dataset: envVars.NEXT_PUBLIC_SANITY_DATASET,
    apiVersion: envVars.NEXT_PUBLIC_SANITY_API_VERSION || '2025-10-19',
    token: envVars.SANITY_API_ADMIN_TOKEN,
    useCdn: false,
};

console.log("Project ID:", config.projectId);
console.log("Dataset:", config.dataset);
console.log("Token Present:", !!config.token);

if (!config.token) {
    console.error("Missing SANITY_API_ADMIN_TOKEN in .env.local");
    process.exit(1);
}

const client = createClient(config);

async function purgeData() {
    try {
        const typesToDelete = ["user", "subreddit", "question", "post", "answer", "comment"];

        console.log("Fetching documents...");

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
            transaction.delete(doc._id);
        });

        console.log("Committing transaction...");
        const result = await transaction.commit();
        console.log("Purge complete.", result);

    } catch (error) {
        console.error("Purge error:", error);
        process.exit(1);
    }
}

purgeData();
