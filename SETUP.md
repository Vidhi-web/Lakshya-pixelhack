# Lakshya - Setup Guide

## ✅ Phase 1 Complete!

Your Next.js 15 project is set up and running at **http://localhost:3000**

## 🚀 What's Working

- Next.js 15 with App Router
- TypeScript configuration
- Tailwind CSS styling
- shadcn/ui components
- Project folder structure
- Landing page with hero section

## 🔑 Next Steps: Get Your API Keys

### 1. Supabase Setup (5 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click "New Project"
4. Fill in:
   - Project name: `lakshya`
   - Database password: (save this!)
   - Region: (closest to you)
5. Wait for project creation (~2 min)
6. Go to **Settings** → **API**
7. Copy these values:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 2. Gemini API Key (2 minutes)

1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Sign in with Google account
3. Click "Create API Key"
4. Select "Create API key in new project"
5. Copy the API key → `GEMINI_API_KEY`

### 3. Update Environment Variables

Open `.env.local` and paste your keys:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhb...your_key_here
SUPABASE_SERVICE_ROLE_KEY=eyJhb...your_service_key_here
GEMINI_API_KEY=AIza...your_gemini_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Create Database Schema (5 minutes)

1. Go to your Supabase Dashboard
2. Click **SQL Editor**
3. We'll create the tables in the next step (wait for instruction)

## 📂 Project Structure

```
lakshya/
├── app/
│   ├── page.tsx               # Landing page ✅
│   ├── layout.tsx             # Root layout ✅
│   └── globals.css            # Global styles ✅
├── components/
│   └── ui/                    # shadcn components ✅
├── lib/
│   ├── supabase/              # Supabase clients ✅
│   ├── types.ts               # TypeScript types ✅
│   └── utils.ts               # Utilities ✅
├── middleware.ts              # Auth middleware ✅
└── .env.local                 # ⚠️ ADD YOUR KEYS HERE
```

## 🧪 Test Current Setup

The dev server is running. Visit http://localhost:3000 to see the landing page!

## 🐛 Troubleshooting

### Dev server not running?
```bash
cd lakshya
npm run dev
```

### Port 3000 already in use?
```bash
# Windows PowerShell
Get-Process -Id (Get-NetTCPConnection -LocalPort 3000).OwningProcess | Stop-Process

# Or change port in package.json:
"dev": "next dev -p 3001"
```

### Missing dependencies?
```bash
npm install
```

## 📋 Next Phase Preview

Once you add your API keys, we'll build:
- 🔐 Authentication (login/signup)
- 🎯 Goal selection page
- 🤖 AI roadmap generation
- 📊 Dashboard
- ✅ Task management
- 📅 Calendar
- 📝 Notes
- ⏱️ Pomodoro timer
- 📈 Analytics

## 🎯 Ready to Continue?

Once you have your API keys in `.env.local`, let me know and we'll proceed with:
1. Database schema creation in Supabase
2. Authentication pages
3. AI roadmap generation

**Estimated time to MVP: 10-12 days**

---

**Questions?** Just ask! 🚀
