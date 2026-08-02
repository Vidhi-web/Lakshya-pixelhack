// Database types
export interface User {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
  preferences?: {
    theme?: 'light' | 'dark';
    pomodoroLength?: number;
  };
  created_at: string;
  updated_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  type: string;
  title: string;
  description?: string;
  target_date?: string;
  is_active: boolean;
  progress: number;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  description?: string;
  target_date?: string;
  status: 'not_started' | 'in_progress' | 'completed';
  order_index: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  goal_id?: string;
  milestone_id?: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

export interface Note {
  id: string;
  user_id: string;
  goal_id?: string;
  task_id?: string;
  title: string;
  content?: string;
  content_type: 'markdown' | 'json';
  tags?: string[];
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface TimetableEvent {
  id: string;
  user_id: string;
  goal_id?: string;
  task_id?: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  recurrence?: Record<string, any>;
  color?: string;
  event_type: 'event' | 'task' | 'pomodoro' | 'class';
  created_at: string;
  updated_at: string;
}

export interface AnalyticsEvent {
  id: string;
  user_id: string;
  goal_id?: string;
  event_type: string;
  metadata?: Record<string, any>;
  timestamp: string;
}

// AI Response types
export interface RoadmapResponse {
  title: string;
  description: string;
  targetDate: string;
  estimatedHours?: number;
  milestones: {
    title: string;
    description: string;
    targetDate: string;
    orderIndex: number;
    estimatedHours?: number;
  }[];
  tasks: {
    title: string;
    description: string;
    milestoneIndex: number;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours?: number;
    tags?: string[];
  }[];
  focusAreas?: string[];
  weeklyHourCommitment?: number;
  metadata?: {
    difficulty?: 'beginner' | 'intermediate' | 'advanced';
    prerequisites?: string[];
    resources?: string[];
  };
}

export interface WeeklyRecommendations {
  summary: string;
  strengths: string[];
  improvements: string[];
  focusAreas: {
    title: string;
    reason: string;
    estimatedHours: number;
  }[];
  suggestedTasks: {
    title: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedHours: number;
    tags: string[];
  }[];
  motivationalMessage: string;
  weeklyGoal: string;
}

// Goal templates
export interface GoalTemplate {
  id: string;
  title: string;
  description: string;
  category: string;
  icon?: string;
  defaultDuration: number; // in days
  focusAreas?: string[];
}

export const GOAL_TEMPLATES: GoalTemplate[] = [
  {
    id: 'HIGHER_STUDIES_PREP',
    title: 'Higher Studies Preparation',
    description: 'Comprehensive preparation for entrance exams and postgraduate programs',
    category: 'exam',
    icon: '🎓',
    defaultDuration: 180,
    focusAreas: ['Core Subjects', 'Aptitude', 'Test Prep', 'Interview Skills'],
  },
  {
    id: 'PLACEMENTS_2027',
    title: 'Campus Placements 2027',
    description: 'Prepare for software engineering roles at top product companies',
    category: 'career',
    icon: '💼',
    defaultDuration: 120,
    focusAreas: ['DSA', 'System Design', 'Projects', 'Resume'],
  },
  {
    id: 'STARTUP_LAUNCH',
    title: 'Launch Startup MVP',
    description: 'Build and launch your startup product in 3 months',
    category: 'entrepreneurship',
    icon: '🚀',
    defaultDuration: 90,
    focusAreas: ['Ideation', 'MVP', 'Launch', 'Growth'],
  },
  {
    id: 'HIGHER_STUDIES',
    title: 'MS/PhD Applications',
    description: 'Prepare for higher studies abroad (GRE, TOEFL, SOP, LORs)',
    category: 'education',
    icon: '🎯',
    defaultDuration: 240,
    focusAreas: ['Test Prep', 'Profile', 'Applications', 'Essays'],
  },
  {
    id: 'SKILL_DEVELOPMENT',
    title: 'Learn New Technology',
    description: 'Master a new programming language, framework, or technology',
    category: 'learning',
    icon: '💡',
    defaultDuration: 60,
    focusAreas: ['Theory', 'Practice', 'Projects'],
  },
  {
    id: 'CUSTOM',
    title: 'Custom Goal',
    description: 'Create your own custom goal with AI assistance',
    category: 'custom',
    icon: '✨',
    defaultDuration: 90,
  },
];
