# 🎯 Lakshya (लक्ष्य) — AI-Powered Personal Productivity & Learning Engine

> **Turn ambitious goals into clear, gamified daily execution with real-time AI guidance.**

[![Next.js](https://img.shields.io/badge/Next.js-16.2.12-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-emerald?style=for-the-badge&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-3.5_Flash-8e44ad?style=for-the-badge&logo=googlegemini)](https://deepmind.google/technologies/gemini/)

---

## 📌 Project Overview

**Lakshya** is an all-in-one productivity and study execution platform tailored for students, competitive exam aspirants (UPSC, GATE, NEET, JEE), and career-focused professionals (Campus Placements, Startups, DSA Mastery). 

Instead of static to-do lists, Lakshya creates an adaptive **AI Island Roadmap**, breaking down ambitious long-term goals into structured milestones and daily actionable quests. Powered by **Google Gemini AI** and **Supabase**, Lakshya incorporates gamification (XP, Level Badges, Streaks), adaptive timetable scheduling, a focus Pomodoro engine, rich-text note taking, and intelligent goal mismatch validation to prevent burnout and ensure steady progress.

---

## ✨ Core Features

### 🏝️ 1. AI Island Roadmap (Gamified Learning Map)
- **AI-Generated Milestones**: Dynamically generates 5–6 sequential phase islands tailored to your goal category (Placement, Startup, GATE, UPSC, DSA).
- **Interactive Quests**: Breaks down each milestone into actionable, prioritized tasks with estimated study hours.
- **Duolingo-Style Level Progression**: Levels unlock sequentially as previous milestone quests are completed.
- **Boss Levels & XP Rewards**: Clearing island levels grants XP, levels up your profile, and unlocks achievement badges.

### 🤖 2. Saathi AI Study Companion
- **Real-Time AI Companion**: Powered by `gemini-3.5-flash-lite`, accessible via a floating assistant drawer across all pages.
- **Grounded Account Context**: Answers questions based strictly on your real active goal, study streak, weak subjects, and daily pending tasks.
- **Semantic Goal Mismatch Validation**: Automatically flags contradictory setup inputs (e.g. UPSC goal category paired with "SDE placement" target) and guides you to resolve them.
- **Concise Hinglish Persona**: Friendly, encouraging, and punchy 2-3 sentence responses.

### 📅 3. Daily Planner & Adaptive Schedule
- **Custom Wake/Sleep Hours**: Choose from presets (*Early Bird 6AM–10PM*, *Regular 8AM–11PM*, *Night Owl 10AM–2AM*, *Late Night 9AM–3AM*) or custom hours.
- **Smart Daily Task Distribution**: Distributes undated tasks across future days (max 3 per day sorted by priority) to prevent daily schedule overload.
- **"Load More Tasks" On-Demand**: Finished early? Click one button to pull tomorrow's tasks into today's execution plan.

### ⏱️ 4. Pomodoro Focus Timer
- **Flexible Focus Sessions**: Presets for *Standard (25m)*, *Short Break (5m)*, *Long Break (15m)*, and *Deep Work (50m)*.
- **Ambient Audio & Notifications**: Integrated audio bell notifications upon timer completion.
- **Automated Session Logging**: Completed focus sessions are automatically recorded in Supabase to track total daily focus hours.

### 🗓️ 5. Interactive Calendar & Task Sync
- **Task-Calendar Synchronization**: One-click schedule button on any task turns it into a calendar event with dedicated start/end time slots.
- **Visual Month/Week View**: Full calendar interface to drag, inspect, and manage scheduled study sessions and deadlines.

### 📝 6. Rich-Text Notes Module
- **TipTap Rich Text Editor**: Format study notes with bold, italics, headings, bullet lists, and code blocks.
- **Search & Tag Filtering**: Quickly locate notes by keyword, custom tags, or favorite status.
- **Theme-Aware Dark/Light Styling**: Fully integrated with Lakshya's dynamic CSS variable theme engine.

### 📅 7. Weekly Timetable Planner
- **Recurring Class/Study Schedule**: Plan weekly recurring schedules for lectures, lab sessions, and study blocks by day of the week.

### 📊 8. Analytics & Productivity Insights
- **Dream Meter & Readiness Index**: Displays calculated goal completion readiness based on completed roadmap tasks.
- **Interactive Recharts Insights**: Area trend charts for 14-day completion history, pie charts for task status distribution, and priority breakdown bar charts.

### 🎨 9. Workspace Vibe Customization
- **5 Dynamic Color Palettes**: *Midnight Navy*, *Dusty Bloom*, *Emerald Prestige*, *Sakura Mauve*, and *Violet Dusk*.
- **Seamless Theme Switcher**: Instantly toggles between light and dark modes with persistent user preference storage.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js 16 (App Router)](https://nextjs.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Database & Auth**: [Supabase PostgreSQL & SSR Auth](https://supabase.com/)
- **AI Engine**: [Google Generative AI SDK (`gemini-3.5-flash-lite`, `gemini-2.0-flash`)](https://ai.google.dev/)
- **Styling**: Vanilla CSS (CSS Custom Properties) + [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [Shadcn UI](https://ui.shadcn.com/), [Lucide React Icons](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)
- **Data Visualization**: [Recharts](https://recharts.org/)
- **Rich Text Editor**: [TipTap Editor](https://tiptap.dev/)
- **Notifications**: [React Hot Toast](https://react-hot-toast.com/)

---

## 📁 Project Directory Structure

```
goalpilot-ai/
├── app/                        # Next.js App Router
│   ├── (auth)/                 # Protected App Routes (Wrapped with OnboardingGuard)
│   │   ├── analytics/          # Productivity Analytics Dashboard & Recharts
│   │   ├── calendar/           # Task-synced Interactive Calendar
│   │   ├── dashboard/          # Gamified Dashboard & High-Priority Quests
│   │   ├── goals/              # Goal Category & Workspace Theme Selection
│   │   ├── notes/              # TipTap Rich-Text Notes Module
│   │   ├── personalize/        # 5-Step Personalization Engine Survey
│   │   ├── planner/            # Daily Timeline Planner & Schedule Presets
│   │   ├── pomodoro/           # Focus Timer & Session Tracker
│   │   ├── roadmap/            # Gamified AI Island Game-Map
│   │   ├── tasks/              # Task Manager with Priority & Calendar Sync
│   │   └── timetable/          # Weekly Recurring Timetable Manager
│   ├── (public)/               # Public Authentication Routes
│   │   ├── login/              # User Login Page
│   │   └── signup/             # User Registration Page
│   ├── api/                    # Serverless API Routes
│   │   ├── ai/                 # Saathi Chat, Goal Validation, Recommendations
│   │   ├── events/             # Calendar Events CRUD
│   │   ├── generate-roadmap/   # Gemini AI Roadmap & Milestone Generator
│   │   ├── goals/              # Active Goal Selection
│   │   ├── milestones/         # Roadmap Milestones API
│   │   ├── notes/              # Notes CRUD
│   │   ├── personalization/    # User Personalization Preferences API
│   │   ├── pomodoro/           # Pomodoro Session Logging
│   │   ├── tasks/              # Tasks CRUD & Status Updates
│   │   ├── timetable/          # Timetable Schedule CRUD
│   │   └── user/               # Onboarding Status & Theme Preferences
│   ├── layout.tsx              # Root Layout with Theme & Auth Providers
│   └── page.tsx                # Marketing Landing Page
├── components/                 # Reusable React UI Components
│   ├── auth/                   # OnboardingGuard Client Route Protection
│   ├── editor/                 # TipTap RichTextEditor Component
│   ├── gamification/           # XP Widgets & Badges
│   ├── layout/                 # Sidebar, Header, Mobile Bottom Navigation
│   ├── planner/                # Timeline View Components
│   ├── roadmap/                # GameMap & MilestoneDrawer Components
│   ├── saathi/                 # Saathi AI Floating Chatbot Drawer
│   └── ui/                     # Shadcn Primitives (Button, Card, Input, etc.)
├── lib/                        # Core Utilities & Services
│   ├── ai/                     # Google Gemini AI Client & Prompts (`gemini.ts`)
│   ├── supabase/               # Supabase Server & Client SDK Initializers
│   ├── theme-config.ts         # Workspace Color Palettes & Tokens
│   └── theme-context.tsx       # React Theme Context Provider
├── public/                     # Static Assets & Icons
├── supabase/                   # Database Migrations & SQL Schemas
│   ├── schema.sql              # Core PostgreSQL Tables & RLS Policies
│   └── migrations/             # Applied Migration Scripts
├── .env.local                  # Local Environment Variables (Git Ignored)
└── package.json                # Project Dependencies & Scripts
```

---

## ⚡ Quick Start & Local Setup

### 📋 Prerequisites
- **Node.js**: `v18.17.0` or higher
- **npm**: `v9.0.0` or higher
- **Supabase Account**: Free project at [supabase.com](https://supabase.com)
- **Google Gemini API Key**: Free key from [Google AI Studio](https://aistudio.google.com/)

---

### 📥 1. Clone the Repository
```bash
git clone https://github.com/Vidhi-web/Lakshya-pixelhack.git
cd Lakshya-pixelhack
```

---

### 📦 2. Install Dependencies
```bash
npm install
```

---

### 🔑 3. Configure Environment Variables
Create a file named `.env.local` in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-supabase-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

# Google Gemini AI API Key
GEMINI_API_KEY=your-google-gemini-api-key

# App Public URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

### 🗄️ 4. Set Up Supabase Database Tables
Run the SQL queries inside `supabase/schema.sql` in your **Supabase SQL Editor** to create the required tables (`users`, `goals`, `user_personalization`, `milestones`, `tasks`, `events`, `notes`, `pomodoro_sessions`, `timetable`, `user_streaks`, `analytics_events`).

---

### 🚀 5. Run the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 🏗️ 6. Verify Production Build
```bash
npm run build
```

---

## 📜 Available NPM Scripts

| Script | Command | Purpose |
|---|---|---|
| `npm run dev` | `next dev` | Launches local development server |
| `npm run build` | `next build` | Compiles optimized production build |
| `npm run start` | `next start` | Runs production server locally |
| `npm run lint` | `eslint` | Runs ESLint syntax and code check |

---

## 🌐 Production Deployment (Vercel)

Lakshya is pre-configured for one-click deployment on **Vercel**:

1. Push your repository to GitHub.
2. Import the project into **[Vercel](https://vercel.com)**.
3. Add the 5 Environment Variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, `NEXT_PUBLIC_APP_URL`).
4. Keep the **Build Command** set to default (`npm run build`).
5. Click **Deploy**!

In your Supabase Dashboard under **Authentication → URL Configuration**, add your Vercel domain under **Site URL** and **Redirect URLs** (`https://your-app.vercel.app/**`).

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
