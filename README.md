# Medical Tourism Forum

A comprehensive medical tourism forum built with Next.js, Sanity CMS, and Clerk authentication.

## Features

- User authentication and profiles
- Q&A system with voting
- Community discussions
- Post creation and management
- Search functionality
- Responsive design

## Profile System

The application has a dual profile system:

### Public Profile Pages (`/profile/[username]`)
- **Purpose**: View any user's public profile
- **Access**: Available to all users
- **Content**: User's questions, answers, bio, credentials
- **Navigation**: Accessed by clicking usernames in posts/comments or from profile dropdown

### Settings Page (`/settings`)
- **Purpose**: Edit your own account settings and profile information
- **Access**: Private - only for logged-in users editing their own profile
- **Content**: Profile picture, name, email, account settings
- **Navigation**: Accessed via "Settings" link in profile dropdown

### Profile Routing Logic
- `/profile` → Redirects to your public profile (`/profile/[your-username]`)
- `/profile/[username]` → Shows public profile for the specified user
- `/settings` → Shows account settings for the logged-in user

## Getting Started

First, install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

Set up environment variables:
```bash
# Copy the example env file
cp .env.example .env.local

# Add your Clerk keys and Sanity configuration
```

Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS, shadcn/ui components
- **Authentication**: Clerk
- **CMS**: Sanity
- **Database**: Sanity Content Lake
- **Deployment**: Vercel (recommended)

## Project Structure

```
src/
├── app/
│   ├── (app)/
│   │   ├── profile/
│   │   │   ├── [username]/    # Public profile pages
│   │   │   └── page.tsx       # Profile redirect
│   │   ├── settings/          # Account settings
│   │   └── ...
│   └── api/
├── components/
│   ├── header/
│   ├── ui/
│   └── ...
├── hooks/
├── lib/
└── sanity/
```

## Profile Navigation Flow

1. **Clicking Avatar (Top Right)**: Opens dropdown → Click name → Goes to your public profile
2. **Clicking Usernames in Posts**: Direct link to that user's public profile  
3. **Settings Link**: Goes to account settings page
4. **Profile Icon in Navigation**: Goes to settings page

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
