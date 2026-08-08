'use client';

import { TrendingUp, CheckCircle2, Clock, Target, Trophy, Zap, Calendar, BarChart3, Activity } from 'lucide-react';
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
  goalType: string;
  goalTitle: string;
}

const COLORS = {
  completed: '#f9b17a', // theme accent
  in_progress: '#675bb2', // theme primary
  todo: '#8f8f8f', // neutral
  cancelled: '#ff4d4d', // red
};

const PRIORITY_COLORS = {
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#22c55e',
};

export default function AnalyticsClient({ stats, recentActivity, tasks, goalType, goalTitle }: AnalyticsClientProps) {
  const weeklyData = getWeeklyProgressData(tasks);
  const taskDistribution = getTaskDistribution(tasks);
  const priorityData = getPriorityBreakdown(tasks);
  const completionTrend = getCompletionTrend(tasks);
  const hoursByDay = getHoursByDay(tasks);
  
  // Dynamic goal label based on user's actual goal
  const goalLabel = (goalType || 'goal').charAt(0).toUpperCase() + (goalType || 'goal').slice(1);
  const dreamMeterLabel = `${goalLabel} Readiness`;
  // Use goalProgress if available, otherwise fall back to task completion rate
  const readinessPercent = stats.goalProgress > 0 ? stats.goalProgress : stats.successRate;
  const daysRemaining = 45; // Placeholder until target_date integration

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: 'var(--theme-background)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Readiness Command Center */}
        <div className="glass-card p-6 md:p-10 flex flex-col md:flex-row items-center gap-10">
          <div className="relative w-48 h-48 flex-shrink-0 flex items-center justify-center">
            <svg className="transform -rotate-90 w-full h-full">
              <circle cx="96" cy="96" r="80" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <circle 
                cx="96" cy="96" r="80" fill="none" 
                stroke="var(--theme-accent)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 80}`}
                strokeDashoffset={`${2 * Math.PI * 80 * (1 - readinessPercent / 100)}`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center">
              <span className="text-4xl font-bold text-white">{readinessPercent}%</span>
              <span className="text-xs text-white/60 mt-1 uppercase tracking-wider">{dreamMeterLabel}</span>
            </div>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold text-white mb-2">Your Dream Meter is climbing!</h1>
            <p className="text-white/70 mb-8 max-w-lg">
              You are {readinessPercent}% ready for your goal. With {daysRemaining} days remaining, you're on track. Keep up the momentum!
            </p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4">
              <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-[var(--theme-accent)]" />
                <div>
                  <div className="text-lg font-bold text-white">{stats.completedTasks}</div>
                  <div className="text-xs text-white/50 uppercase">Tasks Done</div>
                </div>
              </div>
              <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3">
                <Clock className="w-5 h-5 text-[var(--theme-primary)]" />
                <div>
                  <div className="text-lg font-bold text-white">{Math.round(stats.hoursThisWeek)}</div>
                  <div className="text-xs text-white/50 uppercase">Hours Logged</div>
                </div>
              </div>
              <div className="glass-card px-4 py-3 rounded-xl flex items-center gap-3">
                <Activity className="w-5 h-5 text-green-400" />
                <div>
                  <div className="text-lg font-bold text-white">{stats.dayStreak}</div>
                  <div className="text-xs text-white/50 uppercase">Day Streak</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 md:col-span-2">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--theme-accent)]" />
              Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={completionTrend}>
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--theme-accent)" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="var(--theme-accent)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                <YAxis stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--theme-background-alt)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} />
                <Area type="monotone" dataKey="completed" stroke="var(--theme-accent)" strokeWidth={3} fill="url(#colorCompleted)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: 'var(--theme-primary)' }} />
              Task Status
            </h3>
            <div style={{ overflow: 'hidden' }}>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie 
                    data={taskDistribution} 
                    cx="50%" 
                    cy="50%" 
                    labelLine={false} 
                    label={({ percent, cx: labelCx = 0, cy: labelCy = 0, midAngle = 0, innerRadius = 0, outerRadius: or = 0 }) => {
                      const RADIAN = Math.PI / 180;
                      const r = (innerRadius as number) + ((or as number) - (innerRadius as number)) * 0.5;
                      const x = (labelCx as number) + r * Math.cos(-(midAngle as number) * RADIAN);
                      const y = (labelCy as number) + r * Math.sin(-(midAngle as number) * RADIAN);
                      return (
                        <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
                          {`${((percent || 0) * 100).toFixed(0)}%`}
                        </text>
                      );
                    }} 
                    outerRadius={80} 
                    dataKey="value"
                  >
                    {taskDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: 'var(--theme-background-alt)', borderRadius: '8px', border: '1px solid var(--theme-border)', color: 'var(--theme-text-primary)' }} />
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    formatter={(value: string) => <span style={{ color: 'var(--theme-text-primary)', fontSize: '12px' }}>{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-400" />
              Priority Breakdown
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={priorityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="priority" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--theme-background-alt)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.priority.toLowerCase() as keyof typeof PRIORITY_COLORS] || '#8884d8'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-400" />
              Hours by Day
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={hoursByDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="rgba(255,255,255,0.4)" style={{ fontSize: '12px' }} />
                <Tooltip contentStyle={{ backgroundColor: 'var(--theme-background-alt)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', color: '#fff' }} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="hours" fill="var(--theme-primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
                {recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition border border-white/5">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.event_type === 'task_completed' ? 'bg-[var(--theme-accent)]' : 'bg-[var(--theme-primary)]'
                    }`}></div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-white text-sm capitalize truncate">{activity.event_type.replace('_', ' ')}</p>
                      <p className="text-xs text-white/50">
                        {new Date(activity.timestamp).toLocaleString('en-US', {
                          month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-white/40">
                <Target className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No activity yet</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

// Helpers unchanged from original logic
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
