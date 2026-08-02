# Fix Email Rate Limit Error

## Problem
"Email rate limit exceeded" error when signing up/logging in.

## Solution: Disable Email Confirmation (Development Only)

### Steps:

1. Go to your Supabase Dashboard
2. Click on **Authentication** in the left sidebar
3. Click on **Providers**
4. Find **Email** provider
5. Click **Edit** (pencil icon)
6. **Uncheck** "Confirm email"
7. Click **Save**

### Alternative: Use Anonymous Sign-ins

Or you can enable anonymous sign-ins:
1. Authentication → Providers
2. Enable "Anonymous" provider

## For Production

Re-enable email confirmation and set up:
- Custom SMTP settings
- Email templates
- Rate limiting configuration

## Quick Test

After disabling email confirmation:
1. Clear browser cache/cookies
2. Try signing up again
3. Should work immediately without email verification
