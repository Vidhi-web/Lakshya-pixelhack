'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, CheckCircle2, Clock, Target, Trophy, Zap, Calendar, BarChart3 } from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface AnalyticsClientProps {
  stats: {
    successRate: number;
    hoursThisWeek: number;
    dayStreak: number;
    completedTasks: number;
    totalTasks: number;
    goalProgress: number;
  };
  recentActivity: any[];
  tasks: any[];
}

const COLORS = {
  completed: '#10b981',
  in_progress: '#3b82f6',
  todo: '#f59e0b',
  cancelled: '#6b7280',
};

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function AnalyticsClient({ stats, recentActivity, tasks }: AnalyticsClientProps) {
  const weeklyData = getWeeklyProgressData(tasks);
  const taskDistribution = getTaskDistribution(tasks);
  const priorityData = getPriorityBreakdown(tasks);
  const completionTrend = getCompletionTrend(tasks);
  const hoursByDay = getHoursByDay(tasks);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50 to-emerald-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-gray-600">Track your progress and productivity insights</p>
        </div>

        {/* Key Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-xl hover:scale-105 transition">
            <CardContent className="p-6">
              <Trophy className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">{stats.successRate}%</div>
              <div className="text-sm opacity-90">Success Rate</div>
              <div className="text-xs opacity-75 mt-1">
                {stats.completedTasks} of {stats.totalTasks} tasks
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-500 to-cyan-600 text-white shadow-xl hover:scale-105 transition">
            <CardContent className="p-6">
              <Clock className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">{Math.round(stats.hoursThisWeek)}</div>
              <div className="text-sm opacity-90">Hours This Week</div>
              <div className="text-xs opacity-75 mt-1">
                Estimated study time
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-600 text-white shadow-xl hover:scale-105 transition">
            <CardContent className="p-6">
              <Zap className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">{stats.dayStreak}</div>
              <div className="text-sm opacity-90">Active Days</div>
              <div className="text-xs opacity-75 mt-1">
                Days with completions
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-red-600 text-white shadow-xl hover:scale-105 transition">
            <CardContent className="p-6">
              <Target className="w-8 h-8 mb-3 opacity-80" />
              <div className="text-4xl font-bold mb-1">{stats.goalProgress}%</div>
              <div className="text-sm opacity-90">Goal Progress</div>
              <div className="text-xs opacity-75 mt-1">
                Overall completion
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Completion Trend Line Chart */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                Task Completion Trend
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={completionTrend}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.1}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="completed" 
                    stroke="#10b981" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorCompleted)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Task Status Pie Chart */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Task Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={taskDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Secondary Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Priority Breakdown Bar Chart */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                Priority Breakdown
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={priorityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="priority" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="count" fill="#8884d8" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority as keyof typeof PRIORITY_COLORS]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Hours by Day */}
          <Card className="bg-white/80 backdrop-blur-xl shadow-xl">
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                Estimated Hours by Day
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hoursByDay}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                  />
                  <Bar dataKey="hours" fill="#a855f7" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Weekly Progress */}
        <Card className="mb-6 bg-white/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Weekly Task Progress
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="day" stroke="#6b7280" style={{ fontSize: '12px' }} />
                <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #e5e7eb' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  dot={{ r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="bg-white/80 backdrop-blur-xl shadow-xl">
          <CardContent className="p-6">
            <h3 className="text-xl font-bold mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 hover:shadow-md transition">
                    <div className={`w-3 h-3 rounded-full ${
                      activity.event_type === 'task_completed' ? 'bg-green-500' :
                      activity.event_type === 'goal_created' ? 'bg-blue-500' :
                      activity.event_type === 'pomodoro_completed' ? 'bg-red-500' :
                      'bg-purple-500'
                    }`}></div>
                    <div className="flex-1">
                      <p className="font-medium capitalize">{activity.event_type.replace('_', ' ')}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(activity.timestamp).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No activity yet. Start completing tasks!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function getWeeklyProgressData(tasks: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  
  return days.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at);
      return taskDate.toDateString() === date.toDateString();
    });
    
    return {
      day,
      total: dayTasks.length,
      completed: dayTasks.filter(t => t.status === 'completed').length,
    };
  });
}

function getTaskDistribution(tasks: any[]) {
  const statuses = {
    completed: tasks.filter(t => t.status === 'completed').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    cancelled: tasks.filter(t => t.status === 'cancelled').length,
  };
  
  return Object.entries(statuses)
    .filter(([_, value]) => value > 0)
    .map(([key, value]) => ({
      name: key,
      value,
    }));
}

function getPriorityBreakdown(tasks: any[]) {
  const priorities = ['urgent', 'high', 'medium', 'low'];
  
  return priorities.map(priority => ({
    priority: priority.charAt(0).toUpperCase() + priority.slice(1),
    count: tasks.filter(t => t.priority === priority).length,
  }));
}

function getCompletionTrend(tasks: any[]) {
  const last14Days = [];
  const today = new Date();
  
  for (let i = 13; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    
    const completedTasks = tasks.filter(t => {
      if (t.status !== 'completed' || !t.completed_at) return false;
      const completedDate = new Date(t.completed_at);
      return completedDate.toDateString() === date.toDateString();
    });
    
    last14Days.push({
      date: `${date.getMonth() + 1}/${date.getDate()}`,
      completed: completedTasks.length,
    });
  }
  
  return last14Days;
}

function getHoursByDay(tasks: any[]) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date();
  
  return days.map((day, i) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (6 - i));
    
    const dayTasks = tasks.filter(t => {
      const taskDate = new Date(t.created_at);
      return taskDate.toDateString() === date.toDateString();
    });
    
    const hours = dayTasks.reduce((sum, task) => sum + (task.estimated_hours || 0), 0);
    
    return {
      day,
      hours: Math.round(hours * 10) / 10,
    };
  });
}
