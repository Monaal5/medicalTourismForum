# Supabase Storage Setup Instructions

To enable file uploads (images and videos) for posts, you must create a Storage Bucket in your Supabase project.

1.  **Go to Supabase Dashboard**: Open your project in the Supabase Dashboard.
2.  **Navigate to Storage**: Click on the "Storage" icon in the left sidebar.
3.  **Create a New Bucket**:
    *   Click **"New Bucket"**.
    *   **Name**: `post-images` (This exact name is required by the code).
    *   **Public**: Toggle **ON** (The bucket must be public to serve images).
    *   **Allowed MIME types**: Leave blank (or set to `image/*,video/*`).
    *   **Save**.

## Important: Policy Setup
By default, nobody can upload to the bucket. You need to add a policy.

1.  Open the `post-images` bucket configuration (or "Policies" tab in Storage).
2.  Click **"New Policy"**.
3.  Choose **"For full customization"**.
4.  **Name**: "Allow authenticated uploads".
5.  **Allowed operations**: Select **INSERT** (Upload).
6.  **Target roles**: Select `authenticated` (or custom logic).
7.  **Policy definition**: `auth.role() = 'authenticated'` (or `true` if you want to test easily, but `authenticated` is safer).
8.  **Save**.

Also add a policy for **SELECT** (Read/Download) if it's not strictly public (though setting bucket to "Public" usually handles public read).
*   Operation: **SELECT**
*   Policy: `true` (Everyone can view).

## Verify
Once the bucket is created, try uploading an image or video again from the application.
