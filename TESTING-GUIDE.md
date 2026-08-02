# 🧪 Lakshya - Testing Guide

## ✅ Phase 3 Complete - Goal Selection & AI Roadmap

### What's Been Built:

1. **Goal Selection Page** (`/goals`)
   - 6 goal templates (GATE, Placements, Startup, Higher Studies, Skill Development, Custom)
   - Beautiful emerald/teal UI with card selection
   - Custom goal input form
   - AI generation button

2. **AI Roadmap Generation**
   - Gemini 2.0 Flash integration
   - Generates personalized roadmaps with milestones and tasks
   - Saves to Supabase (goals, milestones, tasks tables)
   - Fallback roadmap if AI fails

3. **Dashboard** (`/dashboard`)
   - Goal overview with progress stats
   - 4 stat cards (Progress, Tasks, Milestones, Days Remaining)
   - Milestones list with status indicators
   - Upcoming tasks list with priority badges
   - AI recommendations placeholder

---

## 🚀 How to Test End-to-End Flow

### Step 1: Start the Dev Server
```bash
npm run dev
```
Visit: http://localhost:3000

### Step 2: Test Signup Flow
1. Click **"Get Started"** on homepage
2. Fill in signup form:
   - Email: `test@example.com`
   - Name: `Test User`
   - Password: `password123`
3. Click **"Create Account"**
4. ✅ **Expected**: Redirected to `/goals`

### Step 3: Test Goal Selection
1. You should see 6 goal templates
2. Click on any goal card (e.g., **"GATE Computer Science 2025"**)
3. Card should highlight with emerald border and checkmark
4. Click **"Generate AI Roadmap"** button
5. ✅ **Expected**: 
   - Button shows "Generating Your Roadmap..." with spinner
   - After 5-10 seconds, redirected to `/dashboard`

### Step 4: Test Dashboard View
1. After roadmap generation, you're on `/dashboard`
2. ✅ **Expected to see**:
   - Goal title at the top
   - 4 stat cards showing:
     - Overall Progress (0%)
     - Tasks Completed (0/X)
     - Milestones (0/X)
     - Days Remaining
   - Left card: **Milestones** list with 4-6 milestones
   - Right card: **Upcoming Tasks** list with tasks
   - Bottom: AI Recommendations placeholder

### Step 5: Test Custom Goal
1. Go back to: http://localhost:3000/goals
2. Select **"Custom Goal"** card
3. Fill in:
   - Goal Title: `Learn React Native`
   - Additional Details: `I want to build mobile apps in 2 months`
4. Click **"Generate AI Roadmap"**
5. ✅ **Expected**: Custom roadmap generated and saved

---

## 🔧 Test Commands

### Run Setup Validation
```bash
npm run test:setup
```
✅ All checks should pass

### Check Build
```bash
npm run build
```
✅ Should build without errors

### Start Production Server
```bash
npm start
```
✅ Should run on http://localhost:3000

---

## 🐛 Troubleshooting

### Issue: "Email rate limit exceeded"
**Solution**: 
- Go to Supabase Dashboard → Authentication → Providers → Email
- Uncheck "Confirm email"
- Save

### Issue: "Profile creation error"
**Solution**:
- Go to Supabase SQL Editor
- Run: `supabase/fix-users-insert.sql`

### Issue: "Unauthorized" on roadmap generation
**Solution**:
- Make sure you're logged in
- Check browser console for errors
- Verify GEMINI_API_KEY in `.env.local`

### Issue: Dashboard shows "No active goal"
**Solution**:
- Complete goal selection flow first
- Check Supabase `goals` table for your user_id
- Ensure `is_active = true` for your goal

---

## 📊 What to Check in Supabase

After testing, verify data in Supabase:

### 1. Users Table
```sql
SELECT * FROM users WHERE email = 'test@example.com';
```
✅ Should have 1 row with your user data

### 2. Goals Table
```sql
SELECT * FROM goals WHERE user_id = '<your_user_id>';
```
✅ Should have 1 row with:
- title (e.g., "GATE Computer Science 2025")
- is_active = true
- progress = 0

### 3. Milestones Table
```sql
SELECT * FROM milestones WHERE goal_id = '<your_goal_id>';
```
✅ Should have 4-6 rows with different milestones

### 4. Tasks Table
```sql
SELECT * FROM tasks WHERE goal_id = '<your_goal_id>';
```
✅ Should have 15-30 rows with tasks

### 5. Analytics Events Table
```sql
SELECT * FROM analytics_events WHERE user_id = '<your_user_id>';
```
✅ Should have 1 row with event_type = 'goal_created'

---

## ✨ Features Implemented

- [x] User authentication (signup/login)
- [x] Email confirmation disabled for dev
- [x] Landing page with header/footer
- [x] Goal selection page
- [x] 6 pre-defined goal templates
- [x] Custom goal input
- [x] Gemini AI integration
- [x] AI roadmap generation
- [x] Structured data (goals → milestones → tasks)
- [x] Dashboard with stats
- [x] Milestones display
- [x] Tasks display with priorities
- [x] Progress tracking setup
- [x] Emerald/teal theme throughout

---

## 🔜 Next Steps (Phase 4+)

- [ ] Task management (CRUD operations)
- [ ] Task status updates (todo → in_progress → completed)
- [ ] Progress calculation on task completion
- [ ] Calendar/Timetable view
- [ ] Notes with rich text editor
- [ ] Pomodoro timer
- [ ] Analytics dashboard
- [ ] Weekly AI recommendations
- [ ] Dark/Light mode toggle
- [ ] Mobile responsive improvements

---

## 🎯 Success Criteria

Your Phase 3 is **successful** if:

1. ✅ Signup works without errors
2. ✅ Goal selection page loads
3. ✅ Can select any goal template
4. ✅ AI generates roadmap (takes 5-10 seconds)
5. ✅ Dashboard shows goal data
6. ✅ Milestones and tasks appear
7. ✅ No console errors
8. ✅ Data saved in Supabase

---

## 📝 Test Checklist

Before moving to Phase 4:

- [ ] Test signup with new email
- [ ] Test each goal template
- [ ] Test custom goal
- [ ] Verify data in Supabase
- [ ] Check console for errors
- [ ] Test on different browsers
- [ ] Test mobile view
- [ ] Verify all stats display correctly
- [ ] Ensure redirect flow works

---

**Ready to test!** 🚀

Run `npm run dev` and start testing at http://localhost:3000
