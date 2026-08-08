-- ============================================
-- PART 2.1: Personalization Engine Tables
-- ============================================

-- User personalization data (collected during intake)
CREATE TABLE IF NOT EXISTS public.user_personalization (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL UNIQUE REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  
  -- Academic Background
  current_level TEXT, -- e.g., "3rd Year BTech", "Final Year", "Working Professional"
  weak_subjects TEXT[], -- Array of weak subjects
  strong_subjects TEXT[], -- Array of strong subjects
  
  -- Study Preferences
  daily_available_hours NUMERIC(4,2), -- Hours per day available for study
  preferred_study_time TEXT, -- "morning", "afternoon", "evening", "night", "flexible"
  weekend_availability TEXT, -- "full", "partial", "none"
  
  -- Academic Commitments
  has_college_schedule BOOLEAN DEFAULT false,
  college_hours_per_week NUMERIC(4,2),
  
  -- Exam Details
  exam_date DATE,
  target_rank_score TEXT, -- e.g., "AIR under 500", "95 percentile", "Dream company offer"
  
  -- Wellbeing
  stress_level INTEGER CHECK (stress_level >= 1 AND stress_level <= 5), -- 1=low, 5=high
  
  -- Metadata
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_personalization_user_id ON public.user_personalization(user_id);
CREATE INDEX IF NOT EXISTS idx_user_personalization_goal_id ON public.user_personalization(goal_id);

-- Enable RLS
ALTER TABLE public.user_personalization ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own personalization"
  ON public.user_personalization FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own personalization"
  ON public.user_personalization FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own personalization"
  ON public.user_personalization FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Personalization Engine Analytics Layer
-- ============================================

-- Continuous tracking of user study patterns
CREATE TABLE IF NOT EXISTS public.user_study_patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  goal_id UUID REFERENCES public.goals(id) ON DELETE SET NULL,
  
  -- Calculated Metrics (updated daily by cron job)
  daily_study_hours NUMERIC(5,2) DEFAULT 0, -- Average per day
  consistency_percentage NUMERIC(5,2) DEFAULT 0, -- % of planned days studied
  task_completion_rate NUMERIC(5,2) DEFAULT 0, -- % of tasks completed on time
  
  -- Quiz/Test Performance
  avg_quiz_score NUMERIC(5,2), -- Average score percentage
  quiz_attempts_count INTEGER DEFAULT 0,
  mock_test_avg_score NUMERIC(5,2),
  mock_test_attempts_count INTEGER DEFAULT 0,
  
  -- Behavioral Patterns
  frequently_skipped_topics TEXT[], -- Topics often postponed
  preferred_study_hours TEXT[], -- ["09:00", "14:00", "20:00"] - most productive times
  productivity_peak_time TEXT, -- "morning", "afternoon", "evening", "night"
  
  -- Streak Data
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_study_date DATE,
  
  -- Timestamps
  calculation_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one row per user per day
  UNIQUE(user_id, calculation_date)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_user_study_patterns_user_id ON public.user_study_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_study_patterns_calculation_date ON public.user_study_patterns(calculation_date DESC);

-- Enable RLS
ALTER TABLE public.user_study_patterns ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own study patterns"
  ON public.user_study_patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own study patterns"
  ON public.user_study_patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study patterns"
  ON public.user_study_patterns FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================
-- Edit Signals (Task 2.3 - Daily Planner Feedback)
-- ============================================

CREATE TABLE IF NOT EXISTS public.edit_signals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE,
  
  action_type TEXT NOT NULL CHECK (action_type IN ('reorder', 'reschedule', 'delete', 'duration_change', 'postpone', 'add_personal')),
  
  -- Original vs Modified
  original_data JSONB, -- {scheduled_time, duration, priority, etc.}
  modified_data JSONB,
  
  -- Context
  reason TEXT, -- Optional: why user made this change
  
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_edit_signals_user_id ON public.edit_signals(user_id);
CREATE INDEX IF NOT EXISTS idx_edit_signals_timestamp ON public.edit_signals(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_edit_signals_action_type ON public.edit_signals(action_type);

-- Enable RLS
ALTER TABLE public.edit_signals ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own edit signals"
  ON public.edit_signals FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create edit signals"
  ON public.edit_signals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Roadmap Versions (Task 2.2 - Adaptive Roadmap)
-- ============================================

CREATE TABLE IF NOT EXISTS public.roadmap_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  goal_id UUID NOT NULL REFERENCES public.goals(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  
  version_number INTEGER NOT NULL,
  
  -- Reason for recalculation
  recalculation_reason TEXT, -- e.g., "behind_schedule", "ahead_of_schedule", "missed_tasks", "user_requested"
  
  -- Snapshot of milestones/tasks structure
  milestones_snapshot JSONB NOT NULL,
  
  -- Changes made
  changes_summary JSONB, -- {added_tasks: 5, removed_tasks: 2, rescheduled_tasks: 10}
  
  -- Performance metrics at time of recalculation
  completion_rate NUMERIC(5,2),
  days_remaining INTEGER,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(goal_id, version_number)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_roadmap_versions_goal_id ON public.roadmap_versions(goal_id);
CREATE INDEX IF NOT EXISTS idx_roadmap_versions_created_at ON public.roadmap_versions(created_at DESC);

-- Enable RLS
ALTER TABLE public.roadmap_versions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their roadmap versions"
  ON public.roadmap_versions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert roadmap versions"
  ON public.roadmap_versions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- Trigger: Update updated_at
-- ============================================

DROP TRIGGER IF EXISTS update_user_personalization_updated_at ON public.user_personalization;
CREATE TRIGGER update_user_personalization_updated_at
  BEFORE UPDATE ON public.user_personalization
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_study_patterns_updated_at ON public.user_study_patterns;
CREATE TRIGGER update_user_study_patterns_updated_at
  BEFORE UPDATE ON public.user_study_patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
