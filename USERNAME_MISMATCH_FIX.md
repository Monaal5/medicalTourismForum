# Username Mismatch Troubleshooting Guide

## 🚨 Current Issue

**Problem:** Header shows `MonaalSingh5426` but posts show `Monaal6157`

**Cause:** The user record in Sanity has username `Monaal6157` (created with first name only), but the header is generating `MonaalSingh5426` (using full name).

---

## 🔍 Diagnosis

### What's Happening

```
┌─────────────────────────────────────────────────────────┐
│ User created in Sanity with:                            │
│ - Name at creation: "Monaal"                            │
│ - Generated username: Monaal6157                        │
│ - Stored in Sanity: username = "Monaal6157"            │
└─────────────────────────────────────────────────────────┘
                          │
                          │ Time passes...
                          │ User updates name in Clerk
                          │
                          ▼
┌─────────────────────────────────────────────────────────┐
│ Current Clerk data:                                      │
│ - Full Name: "Monaal Singh"                             │
│ - generateUsername("Monaal Singh", userId)              │
│ - Results in: MonaalSingh5426                           │
└─────────────────────────────────────────────────────────┘
                          │
                          ▼
                 ❌ MISMATCH!
```

### The Root Cause

1. **Initial Creation**: User was created with name "Monaal" → `Monaal6157` saved to Sanity
2. **Name Update**: User updated their Clerk profile to "Monaal Singh"
3. **Header Logic**: Generates new username from current name → `MonaalSingh5426`
4. **API Call**: Should fetch `Monaal6157` from Sanity but something is wrong

---

## ✅ Solutions

### Solution 1: Check API Endpoint (Most Likely)

The API might not be returning the user or failing silently.

**Steps:**

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Filter by "user"
4. Look for request to `/api/user/user_34A...`
5. Check the **Response**

**Expected Response:**
```json
{
  "_id": "user_34A...",
  "username": "Monaal6157",
  "email": "...",
  "imageUrl": "...",
  "bio": null,
  "joinedAt": "2024-..."
}
```

**If you see an error:**
- Check Sanity connection
- Verify user exists in Sanity database
- Check console logs for errors

**If request is not made:**
- API route might not exist
- Check file: `src/app/api/user/[userId]/route.ts`

---

### Solution 2: Use Debug Panel

I've added a debug panel to help diagnose the issue.

**To use it:**

1. Restart your dev server
2. Refresh the page
3. Look for a **black debug panel** in the bottom-right corner
4. It will show:
   - ✅ Clerk user ID
   - ✅ Full name from Clerk
   - ✅ Generated username
   - ✅ Sanity API status
   - ✅ Sanity username (what it SHOULD be)
   - ✅ Final username being used
   - ✅ Match status

**What to check:**

```
Sanity Username: Monaal6157      ← Should match posts
Generated Username: MonaalSingh5426  ← Different!
Final Username: Monaal6157       ← Should use Sanity version
```

If "Final Username" shows `MonaalSingh5426`, the API is failing.

---

### Solution 3: Verify User in Sanity

Check if the user exists in Sanity database.

**Option A: Via Sanity Studio**

1. Open Sanity Studio
2. Go to "Users" content type
3. Search for user with `_id = user_34A...`
4. Check the `username` field

**Option B: Via API**

Open browser console and run:

```javascript
fetch('/api/user/user_34A...')  // Replace with actual user ID
  .then(r => r.json())
  .then(console.log);
```

**Expected Output:**
```json
{
  "_id": "user_34A...",
  "username": "Monaal6157"  ← This is what we need
}
```

**If you get 404 or error:**
The user doesn't exist in Sanity yet. Create a post/question to trigger user creation.

---

### Solution 4: Force User Recreation

If the user is missing from Sanity:

1. **Option A: Create Content**
   - Create a new post or question
   - This will automatically create the user in Sanity
   - Username will be generated from CURRENT name (`MonaalSingh5426`)

2. **Option B: Update Existing User**
   - Go to Sanity Studio
   - Find the user record with `_id = user_34A...`
   - Manually set `username` to match what you want
   - Save

---

### Solution 5: Clear Mismatch (Recommended)

The best solution is to update the Sanity username to match the current name.

**Manual Update via Sanity Studio:**

1. Open Sanity Studio
2. Find user with `_id = user_34A...`
3. Change `username` from `Monaal6157` to `MonaalSingh5426`
4. Update all posts/questions that reference this user
5. Save and refresh app

**Automated Script (Advanced):**

Create a script to update all references:

```typescript
// scripts/update-username.ts
import { adminClient } from '@/sanity/lib/adminClient';

const OLD_USERNAME = 'Monaal6157';
const NEW_USERNAME = 'MonaalSingh5426';
const USER_ID = 'user_34A...';

async function updateUsername() {
  // Update user record
  await adminClient
    .patch(USER_ID)
    .set({ username: NEW_USERNAME })
    .commit();
  
  console.log('✅ User updated');
  
  // Note: Posts/questions reference by ID, so they don't need updating
  // Only the display username needs to change
}

updateUsername();
```

---

## 🔧 Prevention

To prevent this in the future:

### 1. Lock Username on Creation

Once a username is created, never change it even if the name changes.

**Update addUser function:**

```typescript
// src/sanity/lib/user/addUser.ts
export async function addUser({ id, username, email, imageUrl }) {
  const existing = await adminClient.fetch(
    `*[_type == "user" && _id == $id][0]`,
    { id }
  );
  
  if (existing) {
    // User exists, DON'T update username
    return existing;
  }
  
  // Only set username on first creation
  const user = await adminClient.create({
    _id: id,
    _type: "user",
    username,  // This never changes
    email,
    imageUrl,
    joinedAt: new Date().toISOString(),
  });
  
  return user;
}
```

### 2. Add Username to Clerk Metadata

Store the Sanity username in Clerk's user metadata:

```typescript
// When user is created
await clerkClient.users.updateUserMetadata(userId, {
  publicMetadata: {
    sanityUsername: "Monaal6157"
  }
});

// Then use it in components
const username = user.publicMetadata?.sanityUsername || generateUsername(...);
```

### 3. Use Email-Based Usernames

Instead of name-based usernames, use email:

```typescript
function generateUsername(email: string, userId: string) {
  const emailPrefix = email.split('@')[0];
  const hash = hashUserId(userId);
  return `${emailPrefix}${hash}`;
}
```

---

## 🎯 Quick Fix Right Now

**If you just want it working ASAP:**

1. Open Sanity Studio
2. Find user `user_34A...`
3. Change username from `Monaal6157` to `MonaalSingh5426`
4. Refresh your app
5. All links will now use `MonaalSingh5426`

**OR**

1. Delete all your posts/questions
2. Clear Sanity user record
3. Create new content
4. Fresh username will be generated consistently

---

## 📊 Debug Panel Usage

The debug panel shows:

```
┌─────────────────────────────────────────┐
│ 🔍 Username Debug Panel                 │
├─────────────────────────────────────────┤
│ Clerk User ID: user_34A...              │
│ Full Name: Monaal Singh                 │
│ Clerk Username: null                    │
│                                         │
│ Generated Username: MonaalSingh5426     │
│ (From: generateUsername)                │
│                                         │
│ Sanity API Status: ✅ Success           │
│ Sanity Username: Monaal6157             │
│                                         │
│ Final Username: Monaal6157 ✅           │
│ Profile URL: /profile/Monaal6157        │
│                                         │
│ Match Status:                           │
│ ⚠️ MISMATCH DETECTED!                  │
│ Generated: MonaalSingh5426              │
│ Sanity: Monaal6157                      │
└─────────────────────────────────────────┘
```

**Color Coding:**
- 🟢 Green = Success, using Sanity username
- 🟡 Yellow = Warning, no Sanity record
- 🔴 Red = Error or mismatch

---

## ❓ FAQ

### Q: Why does the username change?
**A:** The `generateUsername` function uses the current full name from Clerk. If the name changes, the generated username changes too.

### Q: Which username should I use?
**A:** Always use the one from Sanity database (`Monaal6157`). That's the single source of truth.

### Q: Will this break my posts?
**A:** No. Posts reference users by ID, not username. The username is just for display and URL routing.

### Q: Can I change my username?
**A:** Currently no. Once set in Sanity, it should remain constant. We can add a "change username" feature later.

### Q: What if I want a custom username?
**A:** You'll need to:
1. Update your Sanity user record manually
2. Ensure all profile links use the new username
3. Consider adding a username change feature to the app

---

## 🧪 Test After Fix

1. ✅ Check debug panel shows "✅ Match"
2. ✅ Header profile link goes to correct profile
3. ✅ Post username link goes to same profile
4. ✅ Settings profile link goes to same profile
5. ✅ All URLs are identical
6. ✅ No console errors

---

## 🆘 If Nothing Works

1. Check server logs for API errors
2. Verify Sanity connection is working
3. Check that `src/app/api/user/[userId]/route.ts` exists
4. Restart dev server
5. Clear browser cache
6. Try incognito mode
7. Check Network tab for failed requests

**Still stuck?** Drop the debug panel output in an issue and we'll help!

---

## 📝 Summary

**The Fix:**
- API should fetch `Monaal6157` from Sanity
- Header should use that instead of generating `MonaalSingh5426`
- Debug panel helps identify where the process is failing

**The Prevention:**
- Lock usernames on creation
- Never regenerate based on name changes
- Store username in Clerk metadata as backup

**The Goal:**
- One username, everywhere, always
- Consistent profile links across the app
- Single source of truth (Sanity database)