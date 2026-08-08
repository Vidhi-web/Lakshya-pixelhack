/**
 * Adaptive Roadmap Engine
 * Deterministic backend logic informed by AI output.
 * NOT purely AI-generated — AI provides redistribution suggestions,
 * but final scheduling is deterministic and auditable.
 */

import { createServerClient } from '@/lib/supabase/server';

export type Pace = 'ahead' | 'on-track' | 'behind';

export interface PaceAnalysis {
  pace: Pace;
  completionRate: number; // 0-100
  missedTaskCount: number;
  avgStudyHours: number;
  daysRemaining: number;
}

/**
 * Compute the student's current pace based on task completion and study signals.
 */
export async function computePace(userId: string, goalId: string): Promise<PaceAnalysis> {
  const supabase = await createServerClient();
  
  // Get all tasks for this goal
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .eq('goal_id', goalId);

  // Get goal for days remaining
  const { data: goal } = await supabase
    .from('goals')
    .select('target_date, progress')
    .eq('id', goalId)
    .single();

  const allTasks = tasks || [];
  const now = new Date();
  
  // Identify missed tasks: due_date < today AND status != completed
  const missedTasks = allTasks.filter(t => {
    if (!t.due_date || t.status === 'completed') return false;
    return new Date(t.due_date) < now;
  });

  const completedTasks = allTasks.filter(t => t.status === 'completed');
  const completionRate = allTasks.length > 0 
    ? Math.round((completedTasks.length / allTasks.length) * 100)
    : 0;

  // Get last 14 days of study signals
  const { data: signals } = await supabase
    .from('personalization_signals')
    .select('study_hours, tasks_completed')
    .eq('user_id', userId)
    .gte('date', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('date', { ascending: false });

  const avgStudyHours = signals && signals.length > 0
    ? signals.reduce((sum, s) => sum + (s.study_hours || 0), 0) / signals.length
    : 0;

  const daysRemaining = goal?.target_date
    ? Math.max(0, Math.ceil((new Date(goal.target_date).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : 90;

  // Determine pace
  let pace: Pace = 'on-track';
  if (completionRate >= 80 && missedTasks.length === 0) {
    pace = 'ahead';
  } else if (completionRate < 50 || missedTasks.length > 3) {
    pace = 'behind';
  }

  return { pace, completionRate, missedTaskCount: missedTasks.length, avgStudyHours, daysRemaining };
}

/**
 * Redistribute missed tasks into future days.
 * Deterministic: spreads tasks evenly over available future days.
 * Returns the updated due dates.
 */
export function redistributeMissedTasks(
  missedTasks: any[],
  availableDays: number,
  startDate: Date = new Date()
): { taskId: string; newDueDate: string }[] {
  if (missedTasks.length === 0 || availableDays === 0) return [];
  
  const redistributed: { taskId: string; newDueDate: string }[] = [];
  const daysPerTask = Math.max(1, Math.floor(availableDays / missedTasks.length));
  
  missedTasks.forEach((task, index) => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 1 + (index * daysPerTask)); // start tomorrow
    redistributed.push({
      taskId: task.id,
      newDueDate: newDate.toISOString().split('T')[0],
    });
  });
  
  return redistributed;
}

/**
 * Build a Gemini prompt for roadmap recalculation.
 * Returns a structured prompt string.
 */
export function buildRecalcPrompt(goal: any, paceAnalysis: PaceAnalysis, missedTasks: any[]): string {
  return `You are an adaptive study coach for Indian competitive exam students.

Student Goal: ${goal.title} (${goal.type})
Exam Date: ${goal.target_date || 'Unknown'}
Current Progress: ${goal.progress}%
Completion Rate: ${paceAnalysis.completionRate}%
Current Pace: ${paceAnalysis.pace}
Missed Tasks: ${paceAnalysis.missedTaskCount}
Days Remaining: ${paceAnalysis.daysRemaining}
Avg Daily Study: ${paceAnalysis.avgStudyHours.toFixed(1)} hours

Missed task topics: ${missedTasks.map(t => t.title).join(', ') || 'None'}

Based on this data, provide a JSON response with:
{
  "adjustmentRecommendation": "brief explanation of what to adjust",
  "priorityTopics": ["topic1", "topic2"],  // topics to focus on
  "dailyStudyIncrease": 0,  // suggested hours increase (0 if none needed)
  "shouldAddRevision": false,  // whether to insert revision sessions
  "motivationalMessage": "warm, encouraging message in Hinglish or English"
}

Respond with valid JSON only.`;
}
