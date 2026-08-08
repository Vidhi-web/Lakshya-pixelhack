/**
 * Personalization Engine - Shared Data Layer
 * 
 * This service continuously tracks user study patterns and provides
 * a single source of truth for all AI features (roadmap, planner, etc.)
 */

import { SupabaseClient } from '@supabase/supabase-js';

export interface StudyPatterns {
  userId: string;
  goalId?: string;
  dailyStudyHours: number;
  consistencyPercentage: number;
  taskCompletionRate: number;
  avgQuizScore?: number;
  quizAttemptsCount: number;
  mockTestAvgScore?: number;
  mockTestAttemptsCount: number;
  frequentlySkippedTopics: string[];
  preferredStudyHours: string[];
  productivityPeakTime: string;
  currentStreak: number;
  longestStreak: number;
  lastStudyDate?: string;
}

export class PersonalizationEngine {
  constructor(private supabase: SupabaseClient, private userId: string) {}

  /**
   * Calculate and update study patterns for the user
   * This should be called daily by a cron job or after significant events
   */
  async calculateStudyPatterns(goalId?: string): Promise<StudyPatterns | null> {
    try {
      const today = new Date().toISOString().split('T')[0];
      const last30Days = new Date();
      last30Days.setDate(last30Days.getDate() - 30);

      // 1. Calculate daily study hours (from pomodoro_sessions and task completion)
      const { data: sessions } = await this.supabase
        .from('pomodoro_sessions')
        .select('duration_minutes, start_time')
        .eq('user_id', this.userId)
        .gte('start_time', last30Days.toISOString());

      const totalMinutes = sessions?.reduce((sum, s) => sum + s.duration_minutes, 0) || 0;
      const avgDailyHours = parseFloat((totalMinutes / 60 / 30).toFixed(2));

      // 2. Calculate consistency (days studied vs days in period)
      const uniqueStudyDays = new Set(
        sessions?.map((s) => s.start_time.split('T')[0]) || []
      ).size;
      const consistencyPercentage = parseFloat(((uniqueStudyDays / 30) * 100).toFixed(2));

      // 3. Calculate task completion rate
      const { data: tasks } = await this.supabase
        .from('tasks')
        .select('status, due_date, completed_at')
        .eq('user_id', this.userId)
        .gte('created_at', last30Days.toISOString());

      const completedOnTime = tasks?.filter(
        (t) =>
          t.status === 'completed' &&
          t.due_date &&
          t.completed_at &&
          new Date(t.completed_at) <= new Date(t.due_date)
      ).length || 0;

      const totalDueTasks = tasks?.filter((t) => t.due_date).length || 0;
      const taskCompletionRate = totalDueTasks > 0 
        ? parseFloat(((completedOnTime / totalDueTasks) * 100).toFixed(2)) 
        : 0;

      // 4. Identify frequently skipped topics
      const { data: skippedTasks } = await this.supabase
        .from('edit_signals')
        .select('task_id, action_type')
        .eq('user_id', this.userId)
        .in('action_type', ['postpone', 'delete'])
        .gte('timestamp', last30Days.toISOString());

      // Extract topics/subjects from task titles (simplified)
      const frequentlySkippedTopics: string[] = [];

      // 5. Identify preferred study hours (hours when most productive)
      const preferredStudyHours = sessions
        ?.map((s) => {
          const hour = new Date(s.start_time).getHours();
          return hour.toString().padStart(2, '0') + ':00';
        })
        .reduce((acc: Record<string, number>, hour) => {
          acc[hour] = (acc[hour] || 0) + 1;
          return acc;
        }, {});

      const sortedHours = Object.entries(preferredStudyHours || {})
        .sort(([, a], [, b]) => (b as number) - (a as number))
        .slice(0, 3)
        .map(([hour]) => hour);

      // Determine productivity peak time
      const productivityPeakTime = this.determinePeakTime(sortedHours);

      // 6. Calculate streak
      const { data: recentSessions } = await this.supabase
        .from('pomodoro_sessions')
        .select('start_time')
        .eq('user_id', this.userId)
        .order('start_time', { ascending: false })
        .limit(100);

      const streak = this.calculateStreak(recentSessions || []);

      // 7. Get existing patterns to preserve longest_streak
      const { data: existingPatterns } = await this.supabase
        .from('user_study_patterns')
        .select('longest_streak')
        .eq('user_id', this.userId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single();

      const longestStreak = Math.max(
        streak.currentStreak,
        existingPatterns?.longest_streak || 0
      );

      // 8. Save to database
      const studyPatterns: StudyPatterns = {
        userId: this.userId,
        goalId: goalId,
        dailyStudyHours: avgDailyHours,
        consistencyPercentage,
        taskCompletionRate,
        quizAttemptsCount: 0, // TODO: Implement when quiz system is built
        mockTestAttemptsCount: 0, // TODO: Implement when mock test system is built
        frequentlySkippedTopics,
        preferredStudyHours: sortedHours,
        productivityPeakTime,
        currentStreak: streak.currentStreak,
        longestStreak,
        lastStudyDate: streak.lastStudyDate || undefined,
      };

      const { error } = await this.supabase.from('user_study_patterns').upsert(
        {
          user_id: this.userId,
          goal_id: goalId || null,
          daily_study_hours: avgDailyHours,
          consistency_percentage: consistencyPercentage,
          task_completion_rate: taskCompletionRate,
          avg_quiz_score: null,
          quiz_attempts_count: 0,
          mock_test_avg_score: null,
          mock_test_attempts_count: 0,
          frequently_skipped_topics: frequentlySkippedTopics,
          preferred_study_hours: sortedHours,
          productivity_peak_time: productivityPeakTime,
          current_streak: streak.currentStreak,
          longest_streak: longestStreak,
          last_study_date: streak.lastStudyDate || null,
          calculation_date: today,
        },
        {
          onConflict: 'user_id,calculation_date',
        }
      );

      if (error) {
        console.error('Error updating study patterns:', error);
        return null;
      }

      return studyPatterns;
    } catch (error) {
      console.error('Error calculating study patterns:', error);
      return null;
    }
  }

  /**
   * Get current study patterns for a user
   */
  async getStudyPatterns(goalId?: string): Promise<StudyPatterns | null> {
    try {
      const { data, error } = await this.supabase
        .from('user_study_patterns')
        .select('*')
        .eq('user_id', this.userId)
        .order('calculation_date', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        userId: data.user_id,
        goalId: data.goal_id,
        dailyStudyHours: parseFloat(data.daily_study_hours || 0),
        consistencyPercentage: parseFloat(data.consistency_percentage || 0),
        taskCompletionRate: parseFloat(data.task_completion_rate || 0),
        avgQuizScore: data.avg_quiz_score ? parseFloat(data.avg_quiz_score) : undefined,
        quizAttemptsCount: data.quiz_attempts_count || 0,
        mockTestAvgScore: data.mock_test_avg_score ? parseFloat(data.mock_test_avg_score) : undefined,
        mockTestAttemptsCount: data.mock_test_attempts_count || 0,
        frequentlySkippedTopics: data.frequently_skipped_topics || [],
        preferredStudyHours: data.preferred_study_hours || [],
        productivityPeakTime: data.productivity_peak_time || 'flexible',
        currentStreak: data.current_streak || 0,
        longestStreak: data.longest_streak || 0,
        lastStudyDate: data.last_study_date,
      };
    } catch (error) {
      console.error('Error fetching study patterns:', error);
      return null;
    }
  }

  /**
   * Determine peak productivity time based on study hours
   */
  private determinePeakTime(hours: string[]): string {
    if (hours.length === 0) return 'flexible';

    const firstHour = parseInt(hours[0].split(':')[0]);

    if (firstHour >= 5 && firstHour < 12) return 'morning';
    if (firstHour >= 12 && firstHour < 17) return 'afternoon';
    if (firstHour >= 17 && firstHour < 21) return 'evening';
    return 'night';
  }

  /**
   * Calculate study streak from session history
   */
  private calculateStreak(sessions: Array<{ start_time: string }>): {
    currentStreak: number;
    lastStudyDate: string | null;
  } {
    if (sessions.length === 0) {
      return { currentStreak: 0, lastStudyDate: null };
    }

    const uniqueDays = Array.from(
      new Set(sessions.map((s) => s.start_time.split('T')[0]))
    ).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    // Check if last study was today or yesterday
    if (uniqueDays[0] !== today && uniqueDays[0] !== yesterdayStr) {
      return { currentStreak: 0, lastStudyDate: uniqueDays[0] };
    }

    // Calculate consecutive days
    for (let i = 0; i < uniqueDays.length; i++) {
      const currentDate = new Date(uniqueDays[i]);
      const expectedDate = new Date(today);
      expectedDate.setDate(expectedDate.getDate() - i);

      if (currentDate.toISOString().split('T')[0] === expectedDate.toISOString().split('T')[0]) {
        streak++;
      } else {
        break;
      }
    }

    return { currentStreak: streak, lastStudyDate: uniqueDays[0] };
  }

  /**
   * Get personalization data (intake form responses)
   */
  async getPersonalizationData() {
    const { data, error } = await this.supabase
      .from('user_personalization')
      .select('*')
      .eq('user_id', this.userId)
      .single();

    if (error) {
      console.error('Error fetching personalization data:', error);
      return null;
    }

    return data;
  }

  /**
   * Adjust difficulty/pace based on study patterns
   * Returns a difficulty multiplier (0.5 = easier, 1.0 = normal, 1.5 = harder)
   */
  async getDifficultyMultiplier(): Promise<number> {
    const patterns = await this.getStudyPatterns();
    if (!patterns) return 1.0;

    // High performers get harder tasks
    if (
      patterns.taskCompletionRate >= 90 &&
      patterns.consistencyPercentage >= 80 &&
      (patterns.avgQuizScore || 0) >= 85
    ) {
      return 1.4;
    }

    // Struggling students get easier tasks
    if (
      patterns.taskCompletionRate < 50 ||
      patterns.consistencyPercentage < 40 ||
      (patterns.avgQuizScore || 0) < 50
    ) {
      return 0.6;
    }

    // Default: normal difficulty
    return 1.0;
  }
}
