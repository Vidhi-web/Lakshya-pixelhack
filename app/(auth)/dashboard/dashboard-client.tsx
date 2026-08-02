'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Target, TrendingUp, CheckCircle2, Clock, Calendar, Sparkles, Circle, MoreHorizontal } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardClientProps {
  activeGoal: any;
  milestones: any[];
  tasks: any[];
  stats: {
    totalTasks: number;
    completedTasks: number;
    inProgressTasks: number;
    todoTasks: number;
    completedMilestones: number;
    totalMilestones: number;
    daysRemaining: number | null;
  };
}

export default function DashboardClient({ activeGoal, milestones, tasks, stats }: DashboardClientProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState(tasks);

  const upcomingTasks = localTasks
    .filter((t: any) => t.status === 'todo' || t.status === 'in_progress')
    .slice(0, 5);

  const handleToggleTask = async (taskId: string) => {
    const task = localTasks.find((t: any) => t.id === taskId);
    if (!task) return;

    const newStatus = task.status === 'completed' ? 'todo' : 'completed';

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setLocalTasks(localTasks.map((t: any) => 
          t.id === taskId ? { ...t, status: newStatus } : t
        ));
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to toggle task');
    }
  };

  const targetDate = activeGoal.target_date ? new Date(activeGoal.target_date) : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {activeGoal.title}
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {activeGoal.description}
                </p>
              </div>
            </div>
            <Link href="/tasks">
              <Button className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700">
                View All Tasks
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Overall Progress */}
          <Card className="border-emerald-200 dark:border-emerald-900 hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-emerald-600" />
                <span className="text-3xl font-bold text-emerald-600">
                  {activeGoal.progress}%
                </span>
              </div>
              <Progress value={activeGoal.progress} className="mt-3" />
            </CardContent>
          </Card>

          {/* Tasks Completed */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Tasks Completed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-600" />
                <span className="text-3xl font-bold">
                  {stats.completedTasks}/{stats.totalTasks}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.inProgressTasks} in progress, {stats.todoTasks} remaining
              </p>
            </CardContent>
          </Card>

          {/* Milestones */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Milestones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Target className="w-5 h-5 text-blue-600" />
                <span className="text-3xl font-bold">
                  {stats.completedMilestones}/{stats.totalMilestones}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {stats.totalMilestones - stats.completedMilestones} remaining
              </p>
            </CardContent>
          </Card>

          {/* Days Remaining */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Days Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-3xl font-bold">
                  {stats.daysRemaining !== null ? stats.daysRemaining : 'N/A'}
                </span>
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {targetDate ? targetDate.toLocaleDateString() : 'No target date set'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Milestones & Tasks Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Milestones */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Milestones
              </CardTitle>
              <CardDescription>Your progress towards each milestone</CardDescription>
            </CardHeader>
            <CardContent>
              {milestones && milestones.length > 0 ? (
                <div className="space-y-4">
                  {milestones.map((milestone: any, idx: number) => (
                    <div key={milestone.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        milestone.status === 'completed'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                          : milestone.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle2 className="w-4 h-4" />
                        ) : (
                          <span className="text-sm font-semibold">{idx + 1}</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm">{milestone.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {milestone.description}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                          Target: {new Date(milestone.target_date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No milestones yet</p>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Tasks */}
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-teal-600" />
                    Upcoming Tasks
                  </CardTitle>
                  <CardDescription>Your next tasks to focus on</CardDescription>
                </div>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">
                    View All
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {upcomingTasks.length > 0 ? (
                <div className="space-y-3">
                  {upcomingTasks.map((task: any) => (
                    <div key={task.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors group">
                      <button
                        onClick={() => handleToggleTask(task.id)}
                        className="mt-0.5 flex-shrink-0"
                      >
                        {task.status === 'completed' ? (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <Circle className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 transition-colors" />
                        )}
                      </button>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium text-sm ${task.status === 'completed' ? 'line-through text-gray-500' : ''}`}>
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">
                          {task.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
                              : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
                          }`}>
                            {task.priority}
                          </span>
                          {task.estimated_hours && (
                            <span className="text-xs text-gray-500">
                              ~{task.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No upcoming tasks</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Link href="/tasks">
            <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-emerald-200">
              <CardContent className="pt-6 text-center">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-1">Manage Tasks</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create, edit, and organize your tasks
                </p>
              </CardContent>
            </Card>
          </Link>

          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-teal-200 opacity-50">
            <CardContent className="pt-6 text-center">
              <Calendar className="w-12 h-12 text-teal-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Calendar</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-all hover:scale-105 cursor-pointer border-2 border-transparent hover:border-purple-200 opacity-50">
            <CardContent className="pt-6 text-center">
              <Sparkles className="w-12 h-12 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold mb-1">Analytics</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Coming soon
              </p>
            </CardContent>
          </Card>
        </div>

        {/* AI Recommendations */}
        <Card className="border-purple-200 dark:border-purple-900 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Recommendations
            </CardTitle>
            <CardDescription>Personalized insights coming soon</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
              Weekly AI-powered recommendations will appear here to help you stay on track and optimize your learning journey.
            </p>
            <Button variant="outline" size="sm" disabled>
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Weekly Recommendations
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
