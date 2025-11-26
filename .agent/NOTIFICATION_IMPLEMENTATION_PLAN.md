# Notification System Implementation Plan

## Current Issues
1. Notifications show "monaalmamen" (Clerk username) instead of "Monaal6157" (Sanity username)
2. No notification badge with unread count on bell icon
3. No real-time notification popup/toast
4. Badge doesn't clear when notifications are viewed

## Implementation Steps

### Phase 1: Fix Username Display in Notifications ✅

**Files to Update:**
- `src/app/(app)/notifications/page.tsx` - Update query to fetch correct username
- `src/app/api/notifications/route.ts` - Ensure sender username is from Sanity user

**Changes:**
```typescript
// Update notification query to use Sanity username ---
const notificationsQuery = `
  *[_type == "notification" && recipient._ref == $userId] | order(createdAt desc) {
    _id,
    type,
    read,
    createdAt,
    sender->{
      _id,
      username,  // This should be "Monaal6157" not "monaalmamen"
      imageUrl
    },
    question->{
      _id,
      title
    },
    answer->{
      _id
    },
    comment->{
      _id
    }
  }
`;
```

### Phase 2: Add Notification Badge with Count ✅

**Files to Update:**
- `src/components/header/QuoraHeader.tsx` - Add badge to bell icon

**Implementation:**
1. Fetch unread notification count
2. Display badge with count on bell icon
3. Update count in real-time

```typescript
// Add to QuoraHeader
const [unreadCount, setUnreadCount] = useState(0);

useEffect(() => {
  if (user) {
    fetchUnreadCount();
  }
}, [user]);

const fetchUnreadCount = async () => {
  const response = await fetch('/api/notifications/unread-count');
  const data = await response.json();
  setUnreadCount(data.count);
};

// In JSX
<Link href="/notifications" className="relative">
  <Bell className="w-6 h-6" />
  {unreadCount > 0 && (
    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount}
    </span>
  )}
</Link>
```

### Phase 3: Add Notification Popup/Toast ✅

**Files to Create:**
- `src/components/NotificationToast.tsx` - Toast component
- `src/hooks/useNotifications.ts` - Hook for real-time notifications

**Implementation:**
1. Use polling or WebSocket for real-time updates
2. Show toast when new notification arrives
3. Auto-dismiss after 5 seconds
4. Click to navigate to notification

```typescript
// NotificationToast.tsx
export function NotificationToast({ notification, onClose }) {
  return (
    <div className="fixed top-20 right-4 bg-white shadow-lg rounded-lg p-4 border-l-4 border-blue-600 animate-slide-in">
      <div className="flex items-start space-x-3">
        <Bell className="w-5 h-5 text-blue-600" />
        <div className="flex-1">
          <p className="font-semibold">{notification.title}</p>
          <p className="text-sm text-gray-600">{notification.message}</p>
        </div>
        <button onClick={onClose}>
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
```

### Phase 4: Clear Badge on Click ✅

**Files to Update:**
- `src/app/(app)/notifications/page.tsx` - Mark all as read when page is viewed
- `src/app/api/notifications/mark-read/route.ts` - API to mark notifications as read

**Implementation:**
1. When notifications page is opened, mark all as read
2. Update unread count in header
3. Clear badge

```typescript
// In notifications page
useEffect(() => {
  markAllAsRead();
}, []);

const markAllAsRead = async () => {
  await fetch('/api/notifications/mark-read', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId: user.id }),
  });
};
```

### Phase 5: Real-Time Updates (Optional) ✅

**Options:**
1. **Polling** (Simple) - Check for new notifications every 30 seconds
2. **WebSocket** (Advanced) - Real-time push notifications
3. **Server-Sent Events** (SSE) - One-way real-time updates

**Recommended: Polling for MVP**
```typescript
// useNotifications.ts
export function useNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      fetchNotifications();
    }, 30000); // Poll every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    const response = await fetch('/api/notifications');
    const data = await response.json();
    
    // Check for new notifications
    const newNotifs = data.notifications.filter(
      n => !notifications.find(existing => existing._id === n._id)
    );
    
    // Show toast for new notifications
    newNotifs.forEach(notif => {
      showToast(notif);
    });
    
    setNotifications(data.notifications);
    setUnreadCount(data.unreadCount);
  };
}
```

## API Endpoints Needed

1. **GET /api/notifications** - Fetch all notifications
2. **GET /api/notifications/unread-count** - Get unread count
3. **POST /api/notifications/mark-read** - Mark notifications as read
4. **POST /api/notifications/mark-all-read** - Mark all as read

## Database Schema

Already exists in Sanity:
```typescript
{
  _type: "notification",
  recipient: reference to user,
  sender: reference to user,
  type: "follow" | "answer" | "comment" | "upvote",
  read: boolean,
  createdAt: datetime,
  question?: reference,
  answer?: reference,
  comment?: reference
}
```

## Testing Checklist

- [ ] Notifications show correct Sanity username
- [ ] Badge shows correct unread count
- [ ] Badge appears when new notification arrives
- [ ] Toast popup shows for new notifications
- [ ] Badge clears when notifications page is opened
- [ ] Clicking notification navigates to correct location
- [ ] Real-time updates work (polling)
- [ ] Performance is acceptable (no excessive API calls)

## Estimated Time

- Phase 1 (Fix username): 15 minutes
- Phase 2 (Badge): 30 minutes
- Phase 3 (Toast): 1 hour
- Phase 4 (Clear badge): 30 minutes
- Phase 5 (Real-time): 1-2 hours

**Total: 3-4 hours**

## Priority Order

1. **HIGH**: Fix username display (Phase 1)
2. **HIGH**: Add notification badge (Phase 2)
3. **MEDIUM**: Clear badge on click (Phase 4)
4. **MEDIUM**: Add toast popup (Phase 3)
5. **LOW**: Real-time updates (Phase 5)
