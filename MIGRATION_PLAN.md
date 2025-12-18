# Migration Plan: Sanity to Supabase

## 1. Overview
This document outlines the strategy to migrate the backend of **Medical Tourism Forum** from Sanity CMS to **Supabase** (PostgreSQL). It covers schema design, data migration, client refactoring, and the creation of a new **Admin Panel**.

## 2. Technology Stack Strategy
- **Database**: Supabase (PostgreSQL)
- **Auth**: Keep **Clerk** (linked to Supabase Users table via `clerk_id`)
- **Storage**: Supabase Storage (for images/videos)
- **Admin Panel**: Custom Next.js Admin Routes (`/app/admin`)

## 3. Database Schema (Supabase)
We will create the following tables to mirror the existing Sanity Schema.

### 3.1 Tables

#### `users`
| Column | Type | Notes |
|Refering| to | Sanity Field |
| --- | --- | --- |
| `id` | `uuid` | Primary Key, default `gen_random_uuid()` |
| `clerk_id` | `text` | **Unique**, indexed (Links to Clerk) |
| `username` | `text` | required |
| `email` | `text` | required |
| `image_url` | `text` | |
| `bio` | `text` | |
| `joined_at` | `timestamp` | default `now()` |
| `is_reported` | `boolean` | default `false` |
| `role` | `text` | default `'user'` ('admin', 'moderator') |

#### `communities` (was `subreddit`)
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `title` | `text` | |
| `slug` | `text` | Unique |
| `description` | `text` | |
| `image_url` | `text` | |
| `moderator_id` | `uuid` | FK -> `users.id` |
| `is_deleted` | `boolean` | default `false` |
| `created_at` | `timestamp` | default `now()` |

#### `categories`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `name` | `text` | |
| `slug` | `text` | Unique |
| `icon` | `text` | stores emoji or icon name |

#### `posts`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `title` | `text` | |
| `body` | `jsonb` | Stores complex text content (TipTap JSON) |
| `image_url` | `text` | Main image |
| `gallery` | `jsonb` | Array of media objects |
| `tags` | `text[]` | Array of strings |
| `author_id` | `uuid` | FK -> `users.id` |
| `community_id` | `uuid` | FK -> `communities.id` (nullable) |
| `category_id` | `uuid` | FK -> `categories.id` (nullable) |
| `is_reported` | `boolean` | |
| `published_at` | `timestamp` | |

#### `questions`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `title` | `text` | |
| `description` | `text` | |
| `tags` | `text[]` | |
| `author_id` | `uuid` | FK -> `users.id` |
| `category_id` | `uuid` | FK -> `categories.id` (nullable) |
| `is_answered` | `boolean` | |
| `view_count` | `int` | default 0 |

#### `answers`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `question_id` | `uuid` | FK -> `questions.id` |
| `author_id` | `uuid` | FK -> `users.id` |
| `body` | `jsonb/text` | |
| `is_accepted` | `boolean` | |

#### `comments`
| Column | Type | Notes |
| --- | --- | --- |
| `id` | `uuid` | PK |
| `author_id` | `uuid` | FK -> `users.id` |
| `post_id` | `uuid` | FK -> `posts.id` (nullable) |
| `answer_id` | `uuid` | FK -> `answers.id` (nullable) |
| `body` | `text` | |
| `parent_comment_id` | `uuid` | Self-reference for nested comments (optional) |

#### Junction Tables
- `bookmarks` (`user_id`, `question_id`, `created_at`)
- `user_follows` (`follower_id`, `following_id`, `created_at`)
- `votes` (`user_id`, `item_type`, `item_id`, `vote_type` (+1/-1))

## 4. Admin Panel Specifications
We will create a specific Admin Module at `/admin`.

### Access Control
- Middleware to protect `/admin/*` routes.
- Check if `user.role === 'admin'`.

### Features

#### 1. Dashboard & Analytics
- **Live Stats**: 
    - Total Users Count.
    - Active Users (Signed In).
    - Visitor Analytics (Daily/Weekly/Monthly).
- **System Actions**:
    - **"Nuke" Button**: Ability to delete everything (Reset Database) - *Requires high-level confirmation*.

#### 2. User Management
- **List View**: See all registered users.
- **Actions**:
    - **Create User** (Backend direct creation).
    - **Ban User**: Revoke access.
    - **Delete User**: Permanently remove user.
    - **View Details**: See associated posts, questions, and comments.

#### 3. Content Management
- **Posts**:
    - **Review**: Filter posts linked to specific users.
    - **Create**: Add new posts directly from admin panel.
    - **Delete**: Remove inappropriate content.
- **Questions**:
    - Create/Delete/Edit questions.
- **Communities**:
    - Create/Delete/Edit communities.
- **Categories**:
    - Create/Delete/Edit categories.

## 5. Migration Workflow

### Phase 1: Setup
1.  Create Supabase Project.
2.  Run SQL scripts to create tables and RLS policies.
3.  Install `@supabase/supabase-js`.
4.  Configure Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`).

### Phase 2: Code Refactoring
1.  **Client Helper**: Create `src/lib/supabase.ts` for Supabase client.
2.  **Helpers**: Create `src/lib/db/` helper functions to replace Sanity fetches (e.g., `getPosts`, `getCommunity`, `getUser`).
3.  **API Routes**: Rewrite `/api/user`, `/api/posts`, etc., to use Supabase queries.
4.  **Components**: Update frontend components to use the new data structure (properties might slightly differ, e.g., `_id` becomes `id`).

### Phase 3: Admin Panel Build
1.  Create layout `src/app/admin/layout.tsx`.
2.  Build Dashboard page `src/app/admin/page.tsx` with defined analytics widgets.
3.  Build sub-pages for Users, Posts, Categories, Communities, Questions with CRUD forms.

### Phase 4: Data Migration (Optional/As Needed)
- Write a script to fetch all docs from Sanity JSON and generic `INSERT` statements for Supabase.

