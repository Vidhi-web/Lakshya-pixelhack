-- AI Intelligence Layer Migration
-- Run in Supabase SQL Editor after 001

-- Personalization signals (shared data layer)
CREATE TABLE IF NOT EXISTS public.personalization_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  study_hours NUMERIC(5,2) DEFAULT 0,
  tasks_completed INTEGER DEFAULT 0,
  tasks_planned INTEGER DEFAULT 0,
  quiz_score NUMERIC(5,2),
  preferred_study_time TEXT,
  energy_level INTEGER CHECK (energy_level >= 1 AND energy_level <= 5),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, date)
);

-- Roadmap version history
CREATE TABLE IF NOT EXISTS public.roadmap_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL DEFAULT 1,
  trigger_reason TEXT,
  snapshot JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily plans (AI-generated)
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  plan_date DATE NOT NULL DEFAULT CURRENT_DATE,
  plan_items JSONB NOT NULL DEFAULT '[]',
  generated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  gemini_response_cache TEXT,
  UNIQUE(user_id, plan_date)
);

-- Task edit signals (feedback loop)
CREATE TABLE IF NOT EXISTS public.edit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE SET NULL,
  plan_item_id TEXT,
  action TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AI Reality Check results (weekly)
CREATE TABLE IF NOT EXISTS public.reality_checks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE CASCADE,
  check_date DATE NOT NULL,
  success_probability NUMERIC(5,2),
  current_pace TEXT,
  recommendation TEXT,
  full_analysis JSONB DEFAULT '{}',
  gemini_response_cache TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.personalization_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roadmap_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.edit_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reality_checks ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users manage own personalization_signals" ON public.personalization_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own roadmap_versions" ON public.roadmap_versions FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own daily_plans" ON public.daily_plans FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own edit_signals" ON public.edit_signals FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users manage own reality_checks" ON public.reality_checks FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
