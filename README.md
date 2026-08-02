# 🎯 Lakshya

**Your Goal, Your Path, Your Success**

> AI-powered productivity platform designed for Indian students to achieve their academic and career goals with personalized roadmaps, smart task management, and AI-driven insights.

---

## ✨ Features

### 🤖 AI-Powered
- **Roadmap Generation**: Gemini AI transforms goals into structured milestones and tasks
- **Weekly Recommendations**: Personalized suggestions based on your activity patterns
- **Intelligent Insights**: Data-driven productivity analytics

### 🎯 Goal-Centric
- **Adaptive Dashboard**: UI changes based on your selected goal (GATE, Placements, Startup, etc.)
- **Goal Templates**: Pre-configured roadmaps for popular student goals
- **Progress Tracking**: Real-time visualization of goal completion

### 🛠️ All-in-One Productivity
- **Task Management**: Smart task board with priorities, tags, and deadlines
- **Timetable**: Integrated calendar with recurring events
- **Notes**: Markdown-based note-taking linked to tasks and goals
- **Pomodoro Timer**: Focus tracking with analytics integration
- **Analytics Dashboard**: Productivity heatmaps, charts, and insights

### 🎨 Modern UX
- **Dark/Light Mode**: Fully themed interface
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Smooth Animations**: Framer Motion transitions
- **Premium UI**: Built with shadcn/ui and Tailwind CSS

---

## 🏗️ Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Components**: shadcn/ui (Radix UI)
- **State**: Zustand
- **Animations**: Framer Motion
- **Charts**: Recharts
- **Icons**: Lucide Icons

### Backend
- **Runtime**: Next.js Server Actions & Route Handlers
- **Database**: Supabase PostgreSQL
- **Auth**: Supabase Authentication
- **AI**: Google Gemini 2.5 Flash
- **Storage**: Supabase Storage (future)

### DevOps
- **Hosting**: Vercel
- **Database**: Supabase Cloud
- **CI/CD**: Vercel Automatic Deployments

---

## 🚦 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Supabase account
- Google Gemini API key

### Installation

1. **Clone and install dependencies**
```bash
cd lakshya
npm install
```

2. **Set up environment variables**
```bash
cp .env.example .env.local
```

Add your API keys to `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
GEMINI_API_KEY=your_gemini_api_key
```

3. **Run development server**
```bash
npm run dev
```

4. **Open http://localhost:3000**

See [SETUP.md](./SETUP.md) for detailed instructions.

---

## 📁 Project Structure

```
lakshya/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Protected routes
│   │   ├── dashboard/      # Main dashboard
│   │   ├── tasks/          # Task management
│   │   ├── timetable/      # Calendar
│   │   ├── notes/          # Notes
│   │   └── analytics/      # Analytics
│   ├── (public)/           # Public routes
│   │   ├── login/          # Login page
│   │   └── signup/         # Signup page
│   ├── api/                # API routes
│   │   └── ai/             # AI endpoints
│   └── actions/            # Server Actions
├── components/             # React components
│   ├── ui/                 # shadcn components
│   ├── dashboard/          # Dashboard widgets
│   ├── tasks/              # Task components
│   └── shared/             # Shared components
├── lib/                    # Utilities
│   ├── supabase/           # Supabase clients
│   ├── ai/                 # AI services
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Helper functions
├── stores/                 # Zustand stores
├── hooks/                  # Custom React hooks
└── docs/                   # Documentation
```

---

## 🎯 Popular Goal Templates

- **GATE 2025** - Complete exam preparation roadmap
- **Campus Placements** - DSA, projects, and interview prep
- **Startup Launch** - MVP development and launch plan
- **Higher Studies** - GRE, TOEFL, SOP, and applications
- **Skill Development** - Learn new technologies
- **Custom Goals** - AI-generated custom roadmaps

---

## 🗺️ Development Roadmap

### ✅ Phase 1: Foundation (Complete)
- Project setup
- Core infrastructure
- Landing page

### 🚧 Phase 2: Authentication (In Progress)
- User signup/login
- Session management
- Protected routes

### 📅 Upcoming Phases
- AI Roadmap Generation
- Goal-Adaptive Dashboard
- Task Management
- Timetable/Calendar
- Notes System
- Pomodoro Timer
- Analytics Dashboard
- Weekly AI Recommendations
- UI Polish & Responsive Design

**Estimated MVP Completion**: 10-12 days

---

## 🤝 Contributing

This is a hackathon project currently in active development. Contributions, issues, and feature requests are welcome!

---

## 📄 License

MIT License - see LICENSE file for details

---

## 🙏 Acknowledgments

- **UI Inspiration**: Linear, Notion, Vercel Dashboard
- **Open Source**: Next.js, Supabase, shadcn/ui, Radix UI
- **AI**: Google Gemini 2.5 Flash

---

## 📬 Contact

Built for hackathon by passionate developers

**Demo**: Coming soon on Vercel

---

**⭐ Star this repo if you find it helpful!**
