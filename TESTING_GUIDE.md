# Testing Guide: Profile Routing & Hydration Fixes

## 🚀 Quick Start Testing

### Prerequisites
- Application running locally
- At least one user account (can be newly created)
- Browser with developer console open

---

## Test 1: Hydration Error Fix ✅

### Expected Behavior
No hydration mismatch warnings in console

### Steps
1. Open browser with **DevTools Console** visible
2. Navigate to any profile page: `/profile/[username]`
3. Wait for page to fully load
4. Check console for errors

### ✅ Success Criteria
- **NO** warnings about "hydration mismatch"
- **NO** errors about "attributes didn't match"
- Buttons work normally

### ❌ If Test Fails
- Check that `suppressHydrationWarning` is on all button elements
- Verify ProfileContent.tsx was updated correctly
- Try disabling browser extensions temporarily

---

## Test 2: Username Consistency (Main Test) ✅

### Expected Behavior
All profile links navigate to the same profile page

### Steps

#### Part A: Create Content
1. **Sign in** to your account
2. **Create a post** or **ask a question**
3. Note your display name (e.g., "Monaal")
4. Post should appear in the feed

#### Part B: Test Post Link
1. Find your post in the feed
2. Look for "Posted by u/[username]" link
3. **Click on the username**
4. You'll land on `/profile/[username]`
5. **📝 Copy this URL** (e.g., `/profile/Monaal6157`)

#### Part C: Test Header Link
1. **Click on your avatar** in the top-right header
2. Profile dropdown should open
3. **Click on your name or username** in the dropdown
4. You'll land on `/profile/[username]`
5. **Compare with the URL from Part B**

#### Part D: Test Settings Link
1. Navigate to **Settings** page
2. Find "View Public Profile" button
3. **Click the button**
4. You'll land on `/profile/[username]`
5. **Compare with the URLs from Parts B & C**

#### Part E: Test Direct Redirect
1. Navigate to `/profile` (no username)
2. Should automatically redirect
3. **Compare with the URLs from Parts B, C & D**

### ✅ Success Criteria
**ALL FOUR URLS MUST BE IDENTICAL:**
- Post link URL: `/profile/Monaal6157`
- Header link URL: `/profile/Monaal6157`
- Settings link URL: `/profile/Monaal6157`
- Redirect URL: `/profile/Monaal6157`

### ❌ If Test Fails
- Check browser console for API errors
- Verify `/api/user/[userId]` endpoint exists
- Check that Sanity contains the user record
- Clear browser cache and retry

---

## Test 3: API Endpoint ✅

### Expected Behavior
API returns user data from Sanity

### Steps
1. Get your Clerk user ID (from console: `console.log(user.id)`)
2. Open browser DevTools **Network** tab
3. Navigate to home page (logged in)
4. Look for request to `/api/user/[userId]`
5. Click on the request
6. Check the **Response** tab

### ✅ Success Criteria
Response should contain:
```json
{
  "_id": "user_...",
  "username": "Monaal6157",
  "email": "user@example.com",
  "imageUrl": "https://...",
  "bio": "...",
  "joinedAt": "2024-..."
}
```

### ❌ If Test Fails
- Check that the API route exists: `src/app/api/user/[userId]/route.ts`
- Verify Sanity connection is working
- Check adminClient configuration

---

## Test 4: Multiple Sessions ✅

### Expected Behavior
Username consistency across browser sessions

### Steps
1. **Browser 1**: Sign in and create a post
2. Note the profile URL when clicking your username
3. **Browser 2** (or Incognito): Sign in with same account
4. Click header avatar → profile
5. Compare URLs between Browser 1 and Browser 2

### ✅ Success Criteria
- Both browsers show the same profile URL
- No timing issues or race conditions

---

## Test 5: New User Flow ✅

### Expected Behavior
New users get consistent usernames immediately

### Steps
1. **Sign up** with a brand new account
2. **Immediately** click header avatar → profile
3. Note the URL (e.g., `/profile/NewUser1234`)
4. Go back to home
5. **Create your first post**
6. Click your username in the post
7. Compare with the URL from step 3

### ✅ Success Criteria
- Both URLs are identical
- Username is generated and saved on first login
- No 404 errors

### ❌ If Test Fails
- Check that `addUser` is called in API routes
- Verify user is created in Sanity on first action
- Check the `generateUsername` function

---

## Test 6: Browser Extensions ✅

### Expected Behavior
Works with browser extensions enabled

### Steps
1. Keep browser extensions **ENABLED** (password managers, etc.)
2. Navigate to profile page
3. Inspect button elements in DevTools
4. Look for attributes like `fdprocessedid`

### ✅ Success Criteria
- Buttons may have extra attributes (that's OK!)
- No console errors about hydration
- Buttons still function correctly

---

## Test 7: Edge Cases ✅

### Test 7A: User with Special Characters in Name
1. Create account with name like "O'Brien" or "José"
2. Create a post
3. Test all profile links

### Test 7B: Very Long Names
1. Create account with long name (30+ characters)
2. Create a post
3. Verify username generation works

### Test 7C: User Updates Name in Clerk
1. Sign in
2. Create a post (username saved)
3. Update name in Clerk dashboard
4. Refresh page
5. Verify still using **original** username (from Sanity)

### ✅ Success Criteria
- All edge cases handle gracefully
- No crashes or errors
- Username remains consistent even if name changes

---

## Automated Testing Checklist

```bash
# 1. No TypeScript errors
npm run build

# 2. No linting errors  
npm run lint

# 3. Check diagnostics
# (Use your IDE or build output)
```

---

## Debugging Tips

### Check Sanity Data
```javascript
// In Sanity Studio, query:
*[_type == "user"] {
  _id,
  username,
  email
}
```

### Check API Response
```javascript
// In browser console:
fetch('/api/user/user_2abc123def')
  .then(r => r.json())
  .then(console.log);
```

### Check Username Generation
```javascript
// In browser console:
import { generateUsername } from '@/lib/username';
const username = generateUsername('John Doe', 'user_123');
console.log(username); // Should always be the same
```

---

## Common Issues & Solutions

### Issue: "User not found" error
**Solution:** User not yet created in Sanity. Create a post/question to trigger user creation.

### Issue: Different usernames in different components
**Solution:** Clear browser cache, verify API is being called, check Network tab for errors.

### Issue: Hydration warnings still appear
**Solution:** Verify `suppressHydrationWarning` is on all buttons, check for other hydration sources.

### Issue: Slow profile navigation
**Solution:** Normal - API call takes ~100-300ms. Consider adding loading state.

### Issue: 404 on profile page
**Solution:** Username might not exist in Sanity. Check Sanity Studio for user record.

---

## Performance Testing

### Load Time Test
1. Open DevTools → Network tab
2. Throttle to "Fast 3G"
3. Navigate to profile page
4. Measure time to interactive

**Target:** < 2 seconds on Fast 3G

### API Response Time
1. Check Network tab for `/api/user/[userId]` request
2. Look at "Time" column

**Target:** < 300ms

---

## Final Verification Checklist

Before considering testing complete:

- [ ] ✅ No hydration errors in console
- [ ] ✅ Post username link works correctly
- [ ] ✅ Header profile link works correctly  
- [ ] ✅ Settings profile link works correctly
- [ ] ✅ Profile redirect works correctly
- [ ] ✅ All links go to the SAME profile page
- [ ] ✅ API endpoint returns correct data
- [ ] ✅ Works in multiple browsers
- [ ] ✅ Works with new users
- [ ] ✅ Works with existing users
- [ ] ✅ No console errors or warnings
- [ ] ✅ Buttons are clickable and functional
- [ ] ✅ No TypeScript/build errors

---

## Test Results Template

```
Test Date: [DATE]
Tester: [NAME]
Browser: [Chrome/Firefox/Safari] [VERSION]

✅ Test 1: Hydration Fix - PASSED
✅ Test 2: Username Consistency - PASSED  
✅ Test 3: API Endpoint - PASSED
✅ Test 4: Multiple Sessions - PASSED
✅ Test 5: New User Flow - PASSED
✅ Test 6: Browser Extensions - PASSED
✅ Test 7: Edge Cases - PASSED

Notes:
[Any additional observations]

Overall Result: ✅ ALL TESTS PASSED
```

---

## Support

If you encounter issues not covered in this guide:

1. Check `PROFILE_FIX_SUMMARY.md` for technical details
2. Check `PROFILE_FIX_VISUAL_GUIDE.md` for diagrams
3. Review console logs and Network tab
4. Verify Sanity database contains user records
5. Check that all modified files are saved and server is restarted

---

## Success! 🎉

If all tests pass, the fixes are working correctly:
- ✅ Hydration errors are resolved
- ✅ All profile links are consistent
- ✅ Single source of truth (Sanity) is working
- ✅ User experience is predictable and smooth