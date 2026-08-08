import { createServerClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import AnalyticsClient from './analytics-client';

export default async function AnalyticsPage() {
  const supabase = await createServerClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch user's goal
  const { data: activeGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single();

  // Fetch all tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  // Fetch analytics events
  const { data: analyticsEvents } = await supabase
    .from('analytics_events')
    .select('*')
    .eq('user_id', user.id)
    .order('timestamp', { ascending: false })
    .limit(10);

  // Calculate stats
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const successRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Calculate hours this week
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  
  const weekTasks = tasks?.filter(t => {
    const taskDate = new Date(t.created_at);
    return taskDate >= oneWeekAgo;
  }) || [];
  
  const hoursThisWeek = weekTasks.reduce((sum, task) => {
    return sum + (task.estimated_hours || 0);
  }, 0);

  // Calculate streak (simplified - consecutive days with completed tasks)
  const completedDates = tasks
    ?.filter(t => t.status === 'completed' && t.completed_at)
    .map(t => new Date(t.completed_at!).toDateString()) || [];
  
  const uniqueDates = [...new Set(completedDates)];
  const dayStreak = uniqueDates.length;

  return (
    <AnalyticsClient
      stats={{
        successRate,
        hoursThisWeek,
        dayStreak,
        completedTasks,
        totalTasks,
        goalProgress: activeGoal?.progress || 0,
      }}
      recentActivity={analyticsEvents || []}
      tasks={tasks || []}
      goalType={activeGoal?.type || ''}
      goalTitle={activeGoal?.title || ''}
    />
  );
}

