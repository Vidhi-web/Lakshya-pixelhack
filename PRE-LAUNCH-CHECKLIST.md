# 🚀 Lakshya Pre-Launch Checklist

Complete this checklist before running the app for the first time.

## ☑️ Supabase Setup

- [ ] Created Supabase project
- [ ] Copied Project URL to `.env.local`
- [ ] Copied anon/public key to `.env.local`
- [ ] Copied service_role key to `.env.local`
- [ ] Opened SQL Editor in Supabase
- [ ] Ran the complete `supabase/schema.sql` script
- [ ] Verified all 7 tables were created (check Table Editor)

## ☑️ Gemini API Setup

- [ ] Visited https://aistudio.google.com/apikey
- [ ] Created API key
- [ ] Copied API key to `.env.local`

## ☑️ Environment Configuration

- [ ] `.env.local` file exists
- [ ] All 4 API keys are filled in (no empty values)
- [ ] Saved `.env.local` file

## ☑️ Dependencies

- [ ] Ran `npm install`
- [ ] No errors during installation
- [ ] `node_modules` folder exists

## ☑️ Test Setup

- [ ] Ran `npm run test:setup`
- [ ] All tests passed ✅
- [ ] No red error messages

## ☑️ Ready to Launch!

If all above items are checked:

```bash
npm run dev
```

Then visit: **http://localhost:3000**

---

## 🧪 Quick Test Flow

After launching:

1. **Landing Page**
   - [ ] Page loads without errors
   - [ ] "Get Started" and "Sign In" buttons visible
   - [ ] Features section displays correctly

2. **Sign Up**
   - [ ] Click "Get Started"
   - [ ] Fill in name, email, password
   - [ ] Click "Create Account"
   - [ ] Redirects to dashboard

3. **Dashboard**
   - [ ] Dashboard loads
   - [ ] Shows "Welcome back!" message
   - [ ] Displays 4 stat cards (all showing 0)
   - [ ] Shows "Set Your First Goal" card

4. **Verify in Supabase**
   - [ ] Open Supabase Dashboard
   - [ ] Go to Authentication → Users
   - [ ] Your user appears in the list
   - [ ] Go to Table Editor → users
   - [ ] Your profile exists

5. **Sign Out & Sign In**
   - [ ] Can sign out
   - [ ] Can sign in again with same credentials
   - [ ] Dashboard loads again

---

## ❌ Troubleshooting

### Error: "Failed to fetch"
**Fix**: Check if `.env.local` has correct Supabase URL

### Error: "Invalid API key"
**Fix**: Verify API keys in `.env.local` are correct

### Page shows white screen
**Fix**: Check browser console for errors, restart dev server

### Can't create account
**Fix**: 
1. Check Supabase is running
2. Verify SQL schema was executed
3. Check browser console for errors

### Redirect loop on dashboard
**Fix**: Clear browser cookies and try again

---

## 🎯 Next Steps After Launch

Once everything works:

1. Test goal creation (coming in Phase 3)
2. Test task management
3. Test AI roadmap generation
4. Start building remaining features

---

**Need help?** Check the logs in terminal or browser console for detailed error messages.
