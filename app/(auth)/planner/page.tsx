'use client';

import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Settings, Moon, Sun, X } from 'lucide-react';
import { TimelineView } from '@/components/planner/timeline-view';
import { format, addDays, subDays, isToday } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

const SCHEDULE_PRESETS = [
  { label: 'Early Bird', emoji: '🌅', wake: 6, sleep: 22, desc: '6 AM – 10 PM' },
  { label: 'Regular', emoji: '☀️', wake: 8, sleep: 23, desc: '8 AM – 11 PM' },
  { label: 'Night Owl', emoji: '🦉', wake: 10, sleep: 2, desc: '10 AM – 2 AM' },
  { label: 'Late Night', emoji: '🌙', wake: 9, sleep: 3, desc: '9 AM – 3 AM' },
];

export default function PlannerPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [extraSlots, setExtraSlots] = useState(0);
  const [remainingUndated, setRemainingUndated] = useState(0);

  // Schedule settings with localStorage persistence
  const [wakeHour, setWakeHour] = useState(9);
  const [sleepHour, setSleepHour] = useState(23);

  useEffect(() => {
    // Load saved schedule from localStorage
    const savedWake = localStorage.getItem('planner_wake_hour');
    const savedSleep = localStorage.getItem('planner_sleep_hour');
    if (savedWake) setWakeHour(parseInt(savedWake));
    if (savedSleep) setSleepHour(parseInt(savedSleep));
  }, []);

  const saveSchedule = (wake: number, sleep: number) => {
    setWakeHour(wake);
    setSleepHour(sleep);
    localStorage.setItem('planner_wake_hour', String(wake));
    localStorage.setItem('planner_sleep_hour', String(sleep));
    toast.success(`Schedule set: ${formatHour(wake)} – ${formatHour(sleep)}`);
  };

  const formatHour = (h: number) => {
    const period = h >= 12 && h < 24 ? 'PM' : 'AM';
    const display = h % 12 === 0 ? 12 : h % 12;
    return `${display} ${period}`;
  };

  useEffect(() => {
    setExtraSlots(0);
    fetchTasks(0);
  }, [currentDate]);

  const fetchTasks = async (slots?: number) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tasks');
      if (res.ok) {
        const data = await res.json();
        const dateStr = format(currentDate, 'yyyy-MM-dd');
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        
        const allTasks = data.tasks || [];
        
        // Tasks with explicit due_date matching the selected day
        const datedTasks = allTasks.filter((t: any) => t.due_date?.startsWith(dateStr));
        
        // Undated incomplete tasks — sorted by priority
        const BASE_PER_DAY = 3;
        const currentExtra = slots ?? extraSlots;
        const undatedTasks = allTasks
          .filter((t: any) => !t.due_date && t.status !== 'completed')
          .sort((a: any, b: any) => {
            const priorityOrder: Record<string, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
            return (priorityOrder[a.priority] ?? 2) - (priorityOrder[b.priority] ?? 2);
          });
        
        // Calculate day offset from today
        const daysDiff = Math.max(0, Math.floor(
          (new Date(dateStr).getTime() - new Date(todayStr).getTime()) / (1000 * 60 * 60 * 24)
        ));
        
        // For today (daysDiff=0): show BASE + extra slots
        // For future days: show BASE per day (offset by how many today consumed)
        const todayTotal = BASE_PER_DAY + currentExtra;
        const startIdx = daysDiff === 0 ? 0 : todayTotal + (daysDiff - 1) * BASE_PER_DAY;
        const batchSize = daysDiff === 0 ? todayTotal : BASE_PER_DAY;
        const endIdx = startIdx + batchSize;
        const undatedForDay = undatedTasks.slice(startIdx, endIdx);
        
        // Track remaining undated tasks after this batch
        const remaining = Math.max(0, undatedTasks.length - endIdx);
        setRemainingUndated(remaining);
        
        setTasks([...datedTasks, ...undatedForDay]);
      }
    } catch (e) {
      toast.error('Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadMore = () => {
    const newExtra = extraSlots + 3;
    setExtraSlots(newExtra);
    fetchTasks(newExtra);
    toast.success('Loaded more tasks for today! 🚀');
  };

  const handleToggleStatus = async (task: any) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    const oldTasks = [...tasks];
    
    setTasks(tasks.map((t: any) => t.id === task.id ? { ...t, status: newStatus } : t) as any);
    
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task unmarked');
    } catch (e) {
      setTasks(oldTasks as any);
      toast.error('Failed to update task');
    }
  };

  const completedCount = tasks.filter((t: any) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  return (
    <div className="min-h-screen transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <CalendarIcon className="w-8 h-8" style={{ color: 'var(--theme-accent)' }} />
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--theme-text-primary)' }}>
                Daily Planner
              </h1>
            </div>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
              {formatHour(wakeHour)} – {formatHour(sleepHour)} schedule
            </p>
          </div>
          
          {/* Schedule Settings Button */}
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold transition-all hover:scale-105"
            style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', border: '1px solid var(--theme-border)' }}
          >
            <Settings className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
            Schedule
          </button>
        </div>

        {/* Schedule Settings Panel */}
        {showSettings && (
          <div className="glass-card p-6 mb-6 rounded-2xl border animate-in slide-in-from-top-2" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-extrabold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                ⏰ Your Schedule
              </h3>
              <button onClick={() => setShowSettings(false)} className="opacity-50 hover:opacity-100 transition-opacity">
                <X className="w-4 h-4" style={{ color: 'var(--theme-text-primary)' }} />
              </button>
            </div>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-5">
              {SCHEDULE_PRESETS.map(preset => {
                const isActive = wakeHour === preset.wake && sleepHour === preset.sleep;
                return (
                  <button
                    key={preset.label}
                    onClick={() => saveSchedule(preset.wake, preset.sleep)}
                    className="p-3 rounded-xl text-center transition-all hover:scale-[1.02]"
                    style={{ 
                      background: isActive ? 'var(--theme-accent)' : 'var(--theme-surface)',
                      color: isActive ? '#fff' : 'var(--theme-text-primary)',
                      border: `1.5px solid ${isActive ? 'var(--theme-accent)' : 'var(--theme-border)'}`,
                    }}
                  >
                    <div className="text-lg mb-0.5">{preset.emoji}</div>
                    <div className="text-xs font-bold">{preset.label}</div>
                    <div className="text-[10px] opacity-60">{preset.desc}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Time Pickers */}
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1" style={{ color: 'var(--theme-text-primary)' }}>
                  <Sun className="w-3 h-3" /> Wake Up
                </label>
                <select 
                  value={wakeHour}
                  onChange={(e) => saveSchedule(parseInt(e.target.value), sleepHour)}
                  className="w-full p-2 rounded-lg text-sm font-semibold bg-transparent border"
                  style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i} style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
                      {formatHour(i)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="text-lg font-bold opacity-30 pt-4" style={{ color: 'var(--theme-text-primary)' }}>→</div>
              <div className="flex-1">
                <label className="text-[10px] font-bold uppercase tracking-wider opacity-60 mb-1 flex items-center gap-1" style={{ color: 'var(--theme-text-primary)' }}>
                  <Moon className="w-3 h-3" /> Sleep
                </label>
                <select 
                  value={sleepHour}
                  onChange={(e) => saveSchedule(wakeHour, parseInt(e.target.value))}
                  className="w-full p-2 rounded-lg text-sm font-semibold bg-transparent border"
                  style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                >
                  {Array.from({ length: 24 }, (_, i) => (
                    <option key={i} value={i} style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
                      {formatHour(i)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="text-[10px] mt-3 opacity-40 text-center" style={{ color: 'var(--theme-text-primary)' }}>
              💡 Tip: Tell Saathi AI "I wake up at 9 and sleep at 3 AM" to get schedule suggestions!
            </p>
          </div>
        )}

        <div className="glass-card p-4 md:p-8 mb-8 rounded-2xl border" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center justify-between mb-8">
            <button 
              onClick={() => setCurrentDate(subDays(currentDate, 1))}
              className="p-2 rounded-full hover:bg-white/10 transition"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                {isToday(currentDate) ? 'Today' : format(currentDate, 'EEEE, MMM d')}
              </h2>
            </div>
            <button 
              onClick={() => setCurrentDate(addDays(currentDate, 1))}
              className="p-2 rounded-full hover:bg-white/10 transition"
              style={{ color: 'var(--theme-text-primary)' }}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-8">
            <div className="flex justify-between text-sm font-medium mb-2 opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
              <span>Daily Progress</span>
              <span>{completedCount} of {totalCount} completed</span>
            </div>
            <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
              <div 
                className="h-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%`, background: 'var(--theme-accent)' }}
              />
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              <TimelineView 
                tasks={tasks} 
                onToggleStatus={handleToggleStatus} 
                wakeHour={wakeHour}
                sleepHour={sleepHour}
              />
              {isToday(currentDate) && remainingUndated > 0 && (
                <button
                  onClick={handleLoadMore}
                  className="mt-6 w-full py-3 rounded-2xl border-2 border-dashed text-sm font-bold transition-all hover:scale-[1.01] hover:border-solid flex items-center justify-center gap-2"
                  style={{ 
                    borderColor: 'var(--theme-accent)', 
                    color: 'var(--theme-accent)', 
                    background: 'transparent' 
                  }}
                >
                  🚀 Load {Math.min(remainingUndated, 3)} More Tasks
                  <span className="text-[11px] opacity-60 font-normal">({remainingUndated} remaining)</span>
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
