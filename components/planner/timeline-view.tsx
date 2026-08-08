'use client';

import { CheckCircle2, Circle } from 'lucide-react';
import { format } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  estimated_hours?: number;
  due_date?: string;
  milestone_id: string;
}

interface TimelineViewProps {
  tasks: Task[];
  onToggleStatus: (task: Task) => void;
  wakeHour?: number;  // e.g. 9 for 9 AM
  sleepHour?: number;  // e.g. 3 for 3 AM (next day)
}

export function assignTimeSlots(tasks: Task[], startAt: number = 9) {
  let currentHour = startAt;
  return tasks.map(task => {
    const startHour = currentHour;
    const duration = Math.max(0.5, Math.min(task.estimated_hours || 1, 3));
    currentHour += duration;
    return { ...task, startHour, duration };
  });
}

export function TimelineView({ tasks, onToggleStatus, wakeHour = 9, sleepHour = 23 }: TimelineViewProps) {
  // Handle overnight schedules (e.g., wake at 9, sleep at 3 AM = 3 + 24 = 27)
  const effectiveSleep = sleepHour <= wakeHour ? sleepHour + 24 : sleepHour;
  const TOTAL_HOURS = effectiveSleep - wakeHour;
  const ROW_HEIGHT = 56;
  const gridHeight = TOTAL_HOURS * ROW_HEIGHT;
  
  const pendingTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  
  // Tasks start 1 hour after waking up
  const assignedTasks = assignTimeSlots(pendingTasks, wakeHour + 1);

  // Clamp tasks within the wake-sleep window
  const visibleTasks = assignedTasks
    .filter(t => t.startHour < effectiveSleep)
    .map(t => ({
      ...t,
      duration: Math.min(t.duration, effectiveSleep - t.startHour),
    }));

  const overflowTasks = assignedTasks.filter(t => t.startHour >= effectiveSleep);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'rgba(239, 68, 68, 0.25)';
      case 'high': return 'rgba(249, 115, 22, 0.25)';
      case 'medium': return 'rgba(234, 179, 8, 0.25)';
      default: return 'rgba(34, 197, 94, 0.25)';
    }
  };

  const getPriorityBorder = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'rgba(239, 68, 68, 0.6)';
      case 'high': return 'rgba(249, 115, 22, 0.6)';
      case 'medium': return 'rgba(234, 179, 8, 0.6)';
      default: return 'rgba(34, 197, 94, 0.6)';
    }
  };

  const getPriorityEmoji = (priority: string) => {
    switch (priority) {
      case 'urgent': return '🔴';
      case 'high': return '🟠';
      case 'medium': return '🟡';
      default: return '🟢';
    }
  };

  const now = new Date();
  const currentHour = now.getHours() + now.getMinutes() / 60;
  // For overnight: if current time is past midnight (e.g. 1 AM), treat as 25
  const effectiveCurrentHour = currentHour < wakeHour && sleepHour <= wakeHour ? currentHour + 24 : currentHour;
  const showCurrentTime = effectiveCurrentHour >= wakeHour && effectiveCurrentHour <= effectiveSleep;
  const currentTimeTop = (effectiveCurrentHour - wakeHour) * ROW_HEIGHT;

  // Format hour label, handling >24 hour values
  const formatHourLabel = (hourValue: number) => {
    const normalizedHour = hourValue % 24;
    return format(new Date(2000, 0, 1, normalizedHour, 0), 'h a');
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-3xl mx-auto">
      {/* Scrollable Container */}
      <div 
        className="max-h-[520px] overflow-y-auto p-4 rounded-2xl relative custom-scrollbar border"
        style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-background-alt)' }}
      >
        <div className="relative border-l ml-14 mt-2" style={{ borderColor: 'var(--theme-border)', height: gridHeight }}>
          {/* Hour grid lines */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => (
            <div 
              key={i} 
              className="absolute w-full border-t" 
              style={{ top: i * ROW_HEIGHT, left: 0, borderColor: 'var(--theme-border)', opacity: 0.3 }} 
            />
          ))}
          
          {/* Hour labels */}
          {Array.from({ length: TOTAL_HOURS + 1 }).map((_, i) => {
            const hourValue = wakeHour + i;
            return (
              <div 
                key={i} 
                className="absolute -left-14 text-[11px] w-12 text-right pr-2 font-semibold" 
                style={{ top: i * ROW_HEIGHT - 7, color: 'var(--theme-text-muted)' }}
              >
                {formatHourLabel(hourValue)}
              </div>
            );
          })}

          {/* Current Time Indicator */}
          {showCurrentTime && (
            <div 
              className="absolute left-0 w-full z-20 flex items-center" 
              style={{ top: currentTimeTop, transform: 'translateY(-50%)' }}
            >
              <div className="w-2.5 h-2.5 rounded-full bg-[var(--theme-accent)] -ml-1.5 shadow-md" />
              <div className="flex-1 h-0.5 bg-[var(--theme-accent)] shadow-[0_0_8px_var(--theme-accent)]" />
            </div>
          )}

          {/* Task blocks */}
          <div className="relative w-full" style={{ height: gridHeight }}>
            {visibleTasks.map(task => {
              const top = (task.startHour - wakeHour) * ROW_HEIGHT;
              const height = Math.max(task.duration * ROW_HEIGHT, 32);

              return (
                <div 
                  key={task.id} 
                  className="absolute right-0 left-4 rounded-xl p-2.5 flex flex-col cursor-pointer hover:scale-[1.01] transition-all shadow-sm backdrop-blur-md z-10"
                  style={{ 
                    top, 
                    height: height - 4,
                    background: getPriorityColor(task.priority),
                    border: `1.5px solid ${getPriorityBorder(task.priority)}`
                  }}
                  onClick={() => onToggleStatus(task)}
                >
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-sm line-clamp-1" style={{ color: 'var(--theme-text-primary)' }}>
                      {task.title}
                    </h4>
                    <Circle className="w-4 h-4 flex-shrink-0 opacity-60" style={{ color: 'var(--theme-text-primary)' }} />
                  </div>
                  {height >= ROW_HEIGHT && (
                    <p className="text-xs mt-0.5 line-clamp-1 opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
                      {task.estimated_hours || 1}h • {task.priority}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Overflow tasks */}
      {overflowTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70 flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
            📋 Couldn't fit today ({overflowTasks.length})
          </h3>
          <div className="space-y-2">
            {overflowTasks.map(task => (
              <div 
                key={task.id} 
                className="p-3 rounded-xl flex items-center justify-between glass-card border transition-all"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <span className="text-sm">{getPriorityEmoji(task.priority)}</span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate" style={{ color: 'var(--theme-text-primary)' }}>{task.title}</h4>
                    <p className="text-xs opacity-50" style={{ color: 'var(--theme-text-primary)' }}>{task.estimated_hours || 1}h needed</p>
                  </div>
                </div>
                <button onClick={() => onToggleStatus(task)} className="opacity-40 hover:opacity-100 transition-opacity">
                  <Circle className="w-4 h-4" style={{ color: 'var(--theme-text-primary)' }} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Completed tasks */}
      {completedTasks.length > 0 && (
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
            ✅ Completed ({completedTasks.length})
          </h3>
          <div className="space-y-2">
            {completedTasks.map(task => (
              <div 
                key={task.id} 
                className="p-3 rounded-xl flex items-center justify-between glass-card border transition-all"
                style={{ borderColor: 'var(--theme-border)' }}
              >
                <div className="min-w-0">
                  <h4 className="font-semibold text-sm line-through opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                    {task.title}
                  </h4>
                  <p className="text-xs mt-0.5 opacity-40" style={{ color: 'var(--theme-text-primary)' }}>
                    {task.priority} • {task.estimated_hours || 1}h
                  </p>
                </div>
                <button onClick={() => onToggleStatus(task)} className="text-emerald-500 hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {pendingTasks.length === 0 && completedTasks.length === 0 && (
        <div className="text-center py-12 text-sm opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
          No tasks scheduled for today.
        </div>
      )}
    </div>
  );
}
