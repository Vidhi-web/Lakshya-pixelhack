import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import NewDashboard from './new-dashboard';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const supabase = await createServerClient();

  // Get authenticated user
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch user's active goal
  const { data: activeGoal } = await supabase
    .from('goals')
    .select('*')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  // If no active goal, redirect to goal selection
  if (!activeGoal) {
    redirect('/goals');
  }

  // Fetch milestones for the active goal
  const { data: milestones } = await supabase
    .from('milestones')
    .select('*')
    .eq('goal_id', activeGoal.id)
    .order('order_index', { ascending: true });

  // Fetch tasks for the active goal
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('goal_id', activeGoal.id)
    .order('created_at', { ascending: false });

  // Calculate statistics
  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(t => t.status === 'completed').length || 0;
  const inProgressTasks = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const todoTasks = tasks?.filter(t => t.status === 'todo').length || 0;
  const completedMilestones = milestones?.filter(m => m.status === 'completed').length || 0;
  const totalMilestones = milestones?.length || 0;

  // Get upcoming tasks (next 5 todo/in_progress tasks)
  const upcomingTasks = tasks
    ?.filter(t => t.status === 'todo' || t.status === 'in_progress')
    .slice(0, 5) || [];

  // Calculate target date info
  const targetDate = activeGoal.target_date ? new Date(activeGoal.target_date) : null;
  const today = new Date();
  const daysRemaining = targetDate
    ? Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <NewDashboard
      activeGoal={activeGoal}
      milestones={milestones || []}
      tasks={tasks || []}
      stats={{
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completedMilestones,
        totalMilestones,
        daysRemaining,
      }}
    />
  );
}
