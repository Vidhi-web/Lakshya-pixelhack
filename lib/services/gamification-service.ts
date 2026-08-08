import { SupabaseClient } from '@supabase/supabase-js';

export interface UserGamificationState {
  totalXp: number;
  currentLevel: number;
  xpForNextLevel: number;
  xpProgressInLevel: number;
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string | null;
  comebackMessage?: string;
  unlockedBadges: Array<{
    id: string;
    title: string;
    description: string;
    icon: string;
    unlockedAt: string;
  }>;
}

export class GamificationService {
  constructor(private supabase: SupabaseClient, private userId: string) {}

  /**
   * Calculate Level from total XP: Level = floor(sqrt(XP / 50)) + 1
   */
  public static calculateLevel(totalXp: number): number {
    return Math.floor(Math.sqrt(totalXp / 50)) + 1;
  }

  /**
   * Calculate XP required to reach a specific level
   */
  public static xpRequiredForLevel(level: number): number {
    if (level <= 1) return 0;
    return Math.pow(level - 1, 2) * 50;
  }

  /**
   * Get full gamification status for current user
   */
  async getGamificationState(): Promise<UserGamificationState> {
    const today = new Date().toISOString().split('T')[0];

    // Fetch user XP
    const { data: xpData } = await this.supabase
      .from('user_xp')
      .select('total_xp, current_level')
      .eq('user_id', this.userId)
      .single();

    const totalXp = xpData?.total_xp || 0;
    const currentLevel = GamificationService.calculateLevel(totalXp);

    const xpCurrentLevelBase = GamificationService.xpRequiredForLevel(currentLevel);
    const xpNextLevelBase = GamificationService.xpRequiredForLevel(currentLevel + 1);
    const xpForNextLevel = xpNextLevelBase - xpCurrentLevelBase;
    const xpProgressInLevel = totalXp - xpCurrentLevelBase;

    // Fetch streak data
    const { data: streakData } = await this.supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', this.userId)
      .single();

    const currentStreak = streakData?.current_streak || 0;
    const longestStreak = streakData?.longest_streak || 0;
    const lastActivityDate = streakData?.last_activity_date || null;

    // Check comeback encouragement copy bank
    let comebackMessage: string | undefined;
    if (lastActivityDate) {
      const lastDate = new Date(lastActivityDate);
      const currentDate = new Date(today);
      const diffDays = Math.floor((currentDate.getTime() - lastDate.getTime()) / (1000 * 3600 * 24));
      
      if (diffDays === 1) {
        comebackMessage = "🔥 Great job keeping your momentum going!";
      } else if (diffDays === 2) {
        comebackMessage = "Oops! Champions also miss a day. Let's build your streak again together.";
      } else if (diffDays > 2) {
        comebackMessage = "Welcome back! You didn't fail — you just paused. I've already refreshed your plan from today.";
      }
    }

    // Fetch unlocked badges
    const { data: badgesData } = await this.supabase
      .from('user_badges')
      .select('unlocked_at, badges(id, title, description, icon)')
      .eq('user_id', this.userId);

    const unlockedBadges = (badgesData || []).map((b: any) => ({
      id: b.badges.id,
      title: b.badges.title,
      description: b.badges.description,
      icon: b.badges.icon,
      unlockedAt: b.unlocked_at,
    }));

    return {
      totalXp,
      currentLevel,
      xpForNextLevel,
      xpProgressInLevel,
      currentStreak,
      longestStreak,
      lastActivityDate,
      comebackMessage,
      unlockedBadges,
    };
  }

  /**
   * Award XP to user for a completed event
   */
  async awardXp(
    amount: number,
    eventType: 'task_completion' | 'milestone_completion' | 'pomodoro_session' | 'streak_bonus',
    description?: string,
    sourceId?: string
  ): Promise<{ newTotalXp: number; levelUp: boolean; newLevel: number }> {
    // 1. Get current XP
    const { data: currentXpRecord } = await this.supabase
      .from('user_xp')
      .select('total_xp, current_level')
      .eq('user_id', this.userId)
      .single();

    const prevXp = currentXpRecord?.total_xp || 0;
    const prevLevel = GamificationService.calculateLevel(prevXp);

    const newTotalXp = prevXp + amount;
    const newLevel = GamificationService.calculateLevel(newTotalXp);

    // 2. Upsert user_xp table
    await this.supabase
      .from('user_xp')
      .upsert({
        user_id: this.userId,
        total_xp: newTotalXp,
        current_level: newLevel,
        updated_at: new Date().toISOString(),
      });

    // 3. Log XP event
    await this.supabase
      .from('xp_events')
      .insert({
        user_id: this.userId,
        xp_amount: amount,
        event_type: eventType,
        source_id: sourceId || null,
        description: description || `Earned +${amount} XP`,
      });

    // 4. Update streak
    await this.recordActivity();

    return {
      newTotalXp,
      levelUp: newLevel > prevLevel,
      newLevel,
    };
  }

  /**
   * Record daily activity for streak logic
   */
  async recordActivity(): Promise<{ currentStreak: number; longestStreak: number }> {
    const today = new Date().toISOString().split('T')[0];

    const { data: streakRecord } = await this.supabase
      .from('user_streaks')
      .select('current_streak, longest_streak, last_activity_date')
      .eq('user_id', this.userId)
      .single();

    let currentStreak = streakRecord?.current_streak || 0;
    let longestStreak = streakRecord?.longest_streak || 0;
    const lastDate = streakRecord?.last_activity_date;

    if (!lastDate) {
      currentStreak = 1;
    } else if (lastDate === today) {
      // Already recorded today
    } else {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split('T')[0];

      if (lastDate === yesterdayStr) {
        currentStreak += 1;
      } else {
        // Streak broken, restart at 1
        currentStreak = 1;
      }
    }

    longestStreak = Math.max(currentStreak, longestStreak);

    await this.supabase
      .from('user_streaks')
      .upsert({
        user_id: this.userId,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_activity_date: today,
        updated_at: new Date().toISOString(),
      });

    // Check streak badge unlocks
    if (currentStreak >= 3) {
      await this.unlockBadge('streak_warrior_3');
    }
    if (currentStreak >= 7) {
      await this.unlockBadge('streak_legend_7');
    }

    return { currentStreak, longestStreak };
  }

  /**
   * Unlock a specific badge for the user
   */
  async unlockBadge(badgeId: string): Promise<boolean> {
    const { error } = await this.supabase
      .from('user_badges')
      .insert({
        user_id: this.userId,
        badge_id: badgeId,
      });

    return !error;
  }
}
