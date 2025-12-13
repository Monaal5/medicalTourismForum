
import fs from 'fs';
import path from 'path';
import { createClient } from '@sanity/client';

process.on('unhandledRejection', (reason, p) => {
    fs.appendFileSync('deletion_log.txt', `Unhandled Rejection at: ${p}, reason: ${reason}\n`);
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});

// Load env vars from .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
    const envConfig = fs.readFileSync(envPath, 'utf8');
    envConfig.split('\n').forEach((line) => {
        const [key, value] = line.split('=');
        if (key && value) {
            process.env[key.trim()] = value.trim().replace(/^["']|["']$/g, '');
        }
    });
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
const token = process.env.SANITY_API_ADMIN_TOKEN;

if (!projectId || !dataset || !token) {
    fs.writeFileSync('deletion_log.txt', 'Missing environment variables. Please check .env.local\n');
    process.exit(1);
}

const client = createClient({
    projectId,
    dataset,
    token,
    useCdn: false,
    apiVersion: '2023-05-03',
});

async function deleteByType(type: string) {
    fs.appendFileSync('deletion_log.txt', `Fetching ${type} documents to delete...\n`);
    const query = `*[_type == "${type}"]._id`;
    const ids = await client.fetch(query);

    if (ids.length === 0) {
        fs.appendFileSync('deletion_log.txt', `No ${type} documents found.\n`);
        return;
    }

    fs.appendFileSync('deletion_log.txt', `Found ${ids.length} ${type} documents. Deleting...\n`);

    const batchSize = 50;
    for (let i = 0; i < ids.length; i += batchSize) {
        const batch = ids.slice(i, i + batchSize);
        const transaction = client.transaction();
        batch.forEach((id: string) => {
            transaction.delete(id);
        });
        await transaction.commit();
        fs.appendFileSync('deletion_log.txt', `Deleted batch ${Math.floor(i / batchSize) + 1} of ${type}\n`);
    }
}

async function deleteAllContent() {
    fs.writeFileSync('deletion_log.txt', `Starting sequential deletion...\n`);
    fs.appendFileSync('deletion_log.txt', `Project ID: ${projectId}, Dataset: ${dataset}\n`);

    try {
        // 1. Clear bookmarks from users
        fs.appendFileSync('deletion_log.txt', 'Fetching users with bookmarks...\n');
        const usersWithBookmarks = await client.fetch(`*[_type == "user" && defined(bookmarks)] { _id, bookmarks }`);

        if (usersWithBookmarks.length > 0) {
            const userTransaction = client.transaction();
            usersWithBookmarks.forEach((user: any) => {
                userTransaction.patch(user._id, p => p.unset(['bookmarks']));
            });
            await userTransaction.commit();
            fs.appendFileSync('deletion_log.txt', `Cleared bookmarks from ${usersWithBookmarks.length} users.\n`);
        } else {
            fs.appendFileSync('deletion_log.txt', 'No users with bookmarks found.\n');
        }

        // 2. Delete content in order
        const typesInOrder = ['notification', 'vote', 'comment', 'answer', 'post', 'question'];

        for (const type of typesInOrder) {
            await deleteByType(type);
        }

        fs.appendFileSync('deletion_log.txt', 'Deletion complete.\n');
    } catch (error) {
        fs.appendFileSync('deletion_log.txt', `Error deleting documents: ${error}\n`);
        console.error(error);
    }
}

deleteAllContent();
