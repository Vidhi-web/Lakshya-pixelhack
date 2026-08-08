-- Gamification Engine Migration (Part 3)
-- Run in Supabase SQL Editor after 001 and 002

-- 1. User XP & Level State
CREATE TABLE IF NOT EXISTS public.user_xp (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  total_xp INTEGER NOT NULL DEFAULT 0,
  current_level INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 2. XP Event Log
CREATE TABLE IF NOT EXISTS public.xp_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  xp_amount INTEGER NOT NULL,
  event_type TEXT NOT NULL, -- 'task_completion', 'milestone_completion', 'pomodoro_session', 'streak_bonus'
  source_id TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. User Streak State
CREATE TABLE IF NOT EXISTS public.user_streaks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  current_streak INTEGER NOT NULL DEFAULT 0,
  longest_streak INTEGER NOT NULL DEFAULT 0,
  last_activity_date DATE,
  streak_freeze_available INTEGER NOT NULL DEFAULT 1,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- 4. Badges Master Table
CREATE TABLE IF NOT EXISTS public.badges (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general',
  xp_reward INTEGER NOT NULL DEFAULT 50
);

-- Seed Default Badges
INSERT INTO public.badges (id, title, description, icon, category, xp_reward)
VALUES 
  ('first_step', 'First Step', 'Completed your first study task in Lakshya', '🎯', 'milestone', 50),
  ('streak_warrior_3', 'Streak Warrior', 'Maintained a 3-day study streak', '🔥', 'streak', 100),
  ('streak_legend_7', 'Streak Legend', 'Maintained a 7-day study streak', '👑', 'streak', 250),
  ('focus_master_5', 'Focus Master', 'Completed 5 Pomodoro focus sessions', '⏱️', 'pomodoro', 150),
  ('comeback_hero', 'Comeback Hero', 'Resumed study journey after a pause', '🚀', 'resilience', 100),
  ('milestone_crusher', 'Milestone Crusher', 'Completed an entire roadmap milestone', '🏆', 'milestone', 200)
ON CONFLICT (id) DO NOTHING;

-- 5. User Unlocked Badges
CREATE TABLE IF NOT EXISTS public.user_badges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  badge_id TEXT NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, badge_id)
);

-- Enable RLS
ALTER TABLE public.user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.xp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_streaks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own user_xp" ON public.user_xp FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own xp_events" ON public.xp_events FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own user_streaks" ON public.user_streaks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Anyone can view badges" ON public.badges FOR SELECT USING (true);
CREATE POLICY "Users manage own user_badges" ON public.user_badges FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
