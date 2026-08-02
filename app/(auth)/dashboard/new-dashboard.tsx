'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Target, TrendingUp, CheckCircle2, Clock, Calendar, 
  Sparkles, Circle, Zap, Trophy, AlertTriangle, Lightbulb
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardProps {
  activeGoal: any;
  milestones: any[];
  tasks: any[];
  stats: any;
}

export default function NewDashboard({ activeGoal, milestones, tasks, stats }: DashboardProps) {
  const router = useRouter();
  const [localTasks, setLocalTasks] = useState(tasks);
  const [aiRecommendations, setAiRecommendations] = useState<any>(null);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  // Fetch AI recommendations on mount
  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoadingRecommendations(true);
    try {
      const response = await fetch('/api/ai/recommendations');
      if (response.ok) {
        const data = await response.json();
        setAiRecommendations(data);
      }
    } catch (error) {
      console.error('Failed to fetch recommendations');
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const upcomingTasks = localTasks
    .filter((t: any) => t.status !== 'completed')
    .slice(0, 6);

  // Get upcoming deadlines (tasks with due dates in next 7 days)
  const now = new Date();
  const sevenDaysLater = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  const upcomingDeadlines = localTasks
    .filter((t: any) => {
      if (t.status === 'completed' || !t.due_date) return false;
      const dueDate = new Date(t.due_date);
      return dueDate >= now && dueDate <= sevenDaysLater;
    })
    .sort((a: any, b: any) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const handleToggleTask = async (taskId: string) => {
    const task = localTasks.find((t: any) => t.id === taskId);
    if (!task) return;

    try {
      const newStatus = task.status === 'completed' ? 'todo' : 'completed';
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

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Hero Header */}
        <Card className="mb-8 bg-white border border-gray-200 shadow-sm">
          <CardContent className="p-8">
            <div className="flex items-start justify-between flex-wrap gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-lg bg-blue-600 flex items-center justify-center">
                    <Target className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                      {activeGoal.title}
                    </h1>
                    <p className="text-sm text-gray-600 mt-1">{activeGoal.description}</p>
                  </div>
                </div>
                
                <div className="mt-6">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-xl font-bold text-blue-600">{activeGoal.progress}%</span>
                  </div>
                  <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${activeGoal.progress}%` }}
                    />
                  </div>
                </div>
              </div>
              
              {stats.daysRemaining && (
                <div className="px-6 py-4 rounded-lg bg-gray-50 border border-gray-200">
                  <Trophy className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <div className="text-3xl font-bold text-gray-900 text-center">
                    {stats.daysRemaining}
                  </div>
                  <div className="text-xs text-gray-600 text-center">days remaining</div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid - Premium Design */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Completed Card */}
          <Card className="relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition group">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-teal-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Completed</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.completedTasks}</div>
              <p className="text-sm text-gray-600">Tasks finished</p>
            </CardContent>
          </Card>

          {/* In Progress Card */}
          <Card className="relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition group">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-indigo-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider">In Progress</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.inProgressTasks}</div>
              <p className="text-sm text-gray-600">Active tasks</p>
            </CardContent>
          </Card>

          {/* Milestones Card */}
          <Card className="relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-purple-600 uppercase tracking-wider">Milestones</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.completedMilestones}/{stats.totalMilestones}</div>
              <p className="text-sm text-gray-600">Goals reached</p>
            </CardContent>
          </Card>

          {/* Pending Card */}
          <Card className="relative overflow-hidden bg-white border-0 shadow-lg hover:shadow-xl transition group">
            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 to-red-500/10" />
            <CardContent className="relative p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-md group-hover:scale-110 transition">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xs font-semibold text-orange-600 uppercase tracking-wider">Pending</span>
              </div>
              <div className="text-4xl font-bold text-gray-900 mb-1">{stats.todoTasks}</div>
              <p className="text-sm text-gray-600">To be done</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Milestones */}
          <Card className="col-span-12 lg:col-span-7 bg-white/70 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-emerald-600" />
                Milestones
              </h2>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {milestones.map((m: any, i: number) => (
                  <div key={m.id} className="p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 border hover:shadow-lg transition">
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow ${
                        m.status === 'completed' ? 'bg-gradient-to-br from-green-400 to-emerald-500' :
                        m.status === 'in_progress' ? 'bg-gradient-to-br from-blue-400 to-indigo-500' :
                        'bg-gradient-to-br from-gray-300 to-gray-400'
                      } text-white`}>
                        {m.status === 'completed' ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{m.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{m.description}</p>
                        <div className="flex gap-3 text-xs text-gray-500">
                          <span>{m.target_date ? new Date(m.target_date).toLocaleDateString('en-US') : 'No date'}</span>
                          <span className="px-2 py-0.5 rounded-full bg-gray-200">
                            {m.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions - Ultra Premium Sidebar */}
          <div className="col-span-12 lg:col-span-5 space-y-6">
            {/* AI Recommendations Widget */}
            <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950 dark:to-purple-950 border-2 border-indigo-200 dark:border-indigo-800 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <Lightbulb className="w-5 h-5 text-indigo-600" />
                    AI Recommendations
                  </h3>
                  <button
                    onClick={fetchRecommendations}
                    disabled={loadingRecommendations}
                    className="text-xs px-3 py-1 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition disabled:opacity-50"
                  >
                    {loadingRecommendations ? 'Loading...' : 'Refresh'}
                  </button>
                </div>

                {loadingRecommendations ? (
                  <div className="space-y-3">
                    <div className="h-16 bg-white/50 rounded-lg animate-pulse" />
                    <div className="h-16 bg-white/50 rounded-lg animate-pulse" />
                    <div className="h-16 bg-white/50 rounded-lg animate-pulse" />
                  </div>
                ) : aiRecommendations?.recommendations?.length > 0 ? (
                  <>
                    {aiRecommendations.summary && (
                      <div className="mb-4 p-3 rounded-lg bg-white/70 dark:bg-gray-800/70 border border-indigo-200 dark:border-indigo-800">
                        <p className="text-sm font-semibold text-indigo-900 dark:text-indigo-100">
                          {aiRecommendations.summary}
                        </p>
                        {aiRecommendations.freeHours && (
                          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                            Free time today: ~{aiRecommendations.freeHours} hours
                          </p>
                        )}
                      </div>
                    )}
                    <div className="space-y-3">
                      {aiRecommendations.recommendations.map((rec: any, i: number) => (
                        <div
                          key={i}
                          className={`p-4 rounded-lg border-l-4 bg-white/80 dark:bg-gray-800/80 shadow-sm ${
                            rec.priority === 'high' ? 'border-l-red-500' :
                            rec.priority === 'low' ? 'border-l-green-500' :
                            'border-l-blue-500'
                          }`}
                        >
                          <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed">
                            {rec.text}
                          </p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8 text-sm">
                    No recommendations available yet
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Deadlines Widget */}
            <Card className="bg-white border border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-orange-600" />
                  Upcoming Deadlines
                </h3>
                {upcomingDeadlines.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingDeadlines.map((task: any) => {
                      const dueDate = new Date(task.due_date);
                      const daysUntil = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                      
                      return (
                        <div key={task.id} className="p-3 rounded-lg bg-orange-50 border border-orange-200 hover:shadow-md transition">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-sm text-gray-900 truncate">{task.title}</p>
                              <p className="text-xs text-gray-600 mt-1">
                                {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                              </p>
                            </div>
                            <span className={`text-xs px-2 py-1 rounded-full font-semibold whitespace-nowrap ${
                              daysUntil === 0 ? 'bg-red-100 text-red-700' :
                              daysUntil <= 2 ? 'bg-orange-100 text-orange-700' :
                              'bg-yellow-100 text-yellow-700'
                            }`}>
                              {daysUntil === 0 ? 'Today!' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-6 text-sm">No upcoming deadlines</p>
                )}
              </CardContent>
            </Card>

            {/* Tasks Card */}
            <Link href="/tasks">
              <Card className="relative overflow-hidden bg-gradient-to-br from-emerald-400 via-emerald-500 to-teal-600 text-white border-0 shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-teal-400/20 rounded-full blur-2xl -ml-16 -mb-16" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5" />
                
                <CardContent className="relative p-8">
                  {/* Icon Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <CheckCircle2 className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-sm">Tasks</h3>
                  <p className="text-white/90 text-sm font-medium">Manage tasks</p>
                  
                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Calendar Card */}
            <Link href="/calendar">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-400 via-blue-500 to-indigo-600 text-white border-0 shadow-2xl hover:shadow-blue-500/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/20 rounded-full blur-2xl -ml-16 -mb-16" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5" />
                
                <CardContent className="relative p-8">
                  {/* Icon Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Calendar className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-sm">Calendar</h3>
                  <p className="text-white/90 text-sm font-medium">Schedule</p>
                  
                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>

            {/* Pomodoro Card */}
            <Link href="/pomodoro">
              <Card className="relative overflow-hidden bg-gradient-to-br from-purple-400 via-purple-500 to-pink-600 text-white border-0 shadow-2xl hover:shadow-purple-500/50 hover:scale-[1.03] transition-all duration-300 cursor-pointer group">
                {/* Decorative Elements */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-white/20 transition-all" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-pink-400/20 rounded-full blur-2xl -ml-16 -mb-16" />
                
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-transparent to-white/5" />
                
                <CardContent className="relative p-8">
                  {/* Icon Badge */}
                  <div className="w-16 h-16 rounded-2xl bg-white/25 backdrop-blur-md flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                    <Clock className="w-8 h-8 text-white drop-shadow-md" strokeWidth={2.5} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-2xl font-bold mb-2 drop-shadow-sm">Pomodoro</h3>
                  <p className="text-white/90 text-sm font-medium">Focus time</p>
                  
                  {/* Arrow Indicator */}
                  <div className="absolute bottom-6 right-6 w-8 h-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center group-hover:translate-x-1 transition-transform">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          {/* Tasks */}
          <Card className="col-span-12 bg-white/70 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <Zap className="w-5 h-5 text-orange-600" />
                  Focus Now
                </h2>
                <Link href="/tasks">
                  <Button variant="ghost" size="sm">View All →</Button>
                </Link>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingTasks.map((task: any) => (
                  <div key={task.id} className="p-4 rounded-xl bg-gray-50 border hover:shadow-lg transition">
                    <div className="flex gap-3">
                      <button onClick={() => handleToggleTask(task.id)}>
                        {task.status === 'completed' ? 
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" /> :
                          <Circle className="w-6 h-6 text-gray-400 hover:text-emerald-600" />
                        }
                      </button>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-gray-600 line-clamp-2 mb-2">{task.description}</p>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
