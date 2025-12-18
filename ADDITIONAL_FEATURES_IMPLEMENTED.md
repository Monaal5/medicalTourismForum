# Features Implemented

The following features from the development timeline have been implemented:

## AI & Smart Features
- [x] **Smart Tag Suggestions**: Integrated Google Gemini AI to analyze post content and suggest relevant tags. Available in "Create Post" and "Ask Question" forms.
- [x] **Admin AI Assistant**: Added a chat widget in the admin panel (`AdminAIChat`) that can query system stats and user data.
- [x] **Values-Driven AI Moderation**: Added an API endpoint `/api/admin/automod` that uses AI to check content for violations. (Note: Currently not auto-triggered on every post save, but ready to be hooked up).

## Trust & Safety (Week 1)
- [x] **Global Disclaimer Banner**: A dismissible banner is now visible on all pages warning users about medical advice.
- [x] **Reporting System**: Users can flag/report posts and questions. Includes a database schema update for `reports` table.
- [x] **Anonymous Posting**: Users can now choose to post or ask questions anonymously.
- [x] **Admin Report Management**: Admin dashboard now has a **Reports** page to view, dismiss, resolve, or ban users/delete content based on reports.

## User Engagement (Week 2)
- [x] **Reputation System Backend**: Voting on posts/questions now updates the author's reputation score (+5 for upvote, -2 for downvote).

## Required Database Updates
To support these features, please run the SQL found in `report_system.sql` in your Supabase SQL Editor. This will:
1. Create the `reports` table.
2. Add `is_anonymous` column to `posts` and `questions`.
3. Add `reputation` column to `users` (if not already present, you may need to add `alter table users add column reputation int default 0;` manually if the script doesn't cover it).

## Pending
- Polls & Surveys
- Email Subscription/Alerts
- Multi-quote reply
- PWA Setup
- Success Stories / Resource Pages
