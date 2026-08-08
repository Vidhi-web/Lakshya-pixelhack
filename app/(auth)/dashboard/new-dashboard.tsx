'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  Target, TrendingUp, CheckCircle2, Clock, Calendar, 
  Sparkles, Circle, Zap, Trophy, AlertTriangle, Lightbulb,
  Map, CalendarDays, BarChart3, Timer, StickyNote, Flame, Star, Award, 
  ArrowRight, Activity, ShieldCheck, ChevronRight, Play, Menu, User, Home, BookOpen, Layers
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import toast, { Toaster } from 'react-hot-toast';

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

  const pendingTasks = localTasks.filter((t: any) => t.status !== 'completed');
  const completedTasks = localTasks.filter((t: any) => t.status === 'completed');
  const todayTasks = pendingTasks.slice(0, 3);

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
        if (newStatus === 'completed') {
          toast.success('🎉 Quest Completed! +25 XP ⭐', { id: `task-${taskId}` });
        } else {
          toast.success('Quest reopened', { id: `task-${taskId}` });
        }
        router.refresh();
      }
    } catch (err) {
      console.error('Failed to toggle task');
    }
  };

  const totalTasks = localTasks.length;
  const completedCount = completedTasks.length;
  const xp = completedCount * 25;
  const level = Math.floor(xp / 100) + 1;
  const streak = completedCount > 0 ? Math.min(completedCount, 7) : 0;
  const progressPercent = activeGoal?.progress || 0;

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'urgent': return { label: 'URGENT', bg: 'rgba(244, 114, 182, 0.25)', text: '#e11d48' };
      case 'high': return { label: 'HIGH PRIORITY', bg: 'rgba(251, 146, 60, 0.25)', text: '#ea580c' };
      case 'medium': return { label: 'MEDIUM', bg: 'rgba(250, 204, 21, 0.25)', text: '#ca8a04' };
      default: return { label: 'NORMAL', bg: 'rgba(52, 211, 153, 0.25)', text: '#059669' };
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-12 pt-2 px-3 sm:px-6 max-w-5xl mx-auto space-y-4" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      {/* MOBILE TOP HEADER (Matches image logo & hamburger menu) */}
      <div className="flex md:hidden items-center justify-between py-2 px-1 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
            <Target className="w-5 h-5 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-amber-500">Lakshya</span>
        </div>
        <button className="p-2 rounded-xl glass-card border border-white/10 opacity-80">
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* CARD 1: TOP HERO BANNER (MY GOAL with mountain vector & floating streak card) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 md:p-7 rounded-3xl relative overflow-hidden border shadow-lg"
        style={{ 
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(6, 182, 212, 0.08) 50%, rgba(15, 23, 42, 0.8) 100%)', 
          borderColor: 'rgba(16, 185, 129, 0.3)' 
        }}
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 inline-block">
              MY GOAL
            </span>
            <h2 className="text-xl md:text-2xl font-black leading-snug" style={{ color: 'var(--theme-text-primary)' }}>
              {activeGoal?.title || 'Transitioning from Corporate Finance to Civil Services'}
            </h2>
            <p className="text-xs opacity-75 leading-relaxed max-w-md" style={{ color: 'var(--theme-text-primary)' }}>
              {activeGoal?.description || 'Every focused step today is a step closer to the life I envision. Stay consistent, stay disciplined, and success will follow.'}
            </p>

            <div className="pt-2 max-w-sm">
              <div className="flex justify-between text-xs font-extrabold mb-1">
                <span className="opacity-70">Overall Roadmap Progress</span>
                <span className="text-emerald-400 font-black">{progressPercent}%</span>
              </div>
              <div className="h-2 w-full bg-black/30 rounded-full overflow-hidden border border-emerald-500/20">
                <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${Math.max(5, progressPercent)}%` }} />
              </div>
            </div>
          </div>

          {/* Floating Streak Card (Matches exact image overlay card) */}
          <div className="shrink-0 p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl flex flex-col items-center justify-center text-center w-full md:w-36">
            <div className="flex items-center gap-1 text-[11px] font-extrabold text-amber-400 mb-1">
              <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
              <span>Current Streak</span>
            </div>
            <span className="text-3xl font-black my-0.5" style={{ color: 'var(--theme-text-primary)' }}>
              {streak > 0 ? streak : 7}
            </span>
            <span className="text-[11px] font-bold opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Days</span>
            <span className="text-[10px] font-black text-amber-400 mt-1 flex items-center gap-0.5">
              Keep it going! 🔥
            </span>
          </div>
        </div>

        {/* Background Hiker Mountain Vector Illustration */}
        <div className="absolute right-0 bottom-0 opacity-25 pointer-events-none hidden sm:block">
          <svg width="280" height="160" viewBox="0 0 280 160" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 160L90 70L160 120L280 10V160H0Z" fill="url(#mountainGrad)" />
            <circle cx="210" cy="40" r="16" fill="#fbbf24" fillOpacity="0.6" />
            <defs>
              <linearGradient id="mountainGrad" x1="140" y1="10" x2="140" y2="160" gradientUnits="userSpaceOnUse">
                <stop stopColor="#10b981" stopOpacity="0.8" />
                <stop offset="1" stopColor="#0f172a" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </motion.div>

      {/* ROW OF 3 MODULAR PASTEL STAT CARDS (Target Window, XP Score, Focus Streak) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
        
        {/* CARD 1: TARGET WINDOW (Soft Warm Yellow/Amber) */}
        <div className="p-4 rounded-3xl relative overflow-hidden border shadow-sm flex flex-col justify-between min-h-[145px]"
          style={{ 
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.18) 0%, rgba(245, 158, 11, 0.08) 100%)', 
            borderColor: 'rgba(245, 158, 11, 0.3)' 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-500 border border-amber-500/30">
              TARGET WINDOW
            </span>
            <div className="w-7 h-7 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm mb-1" style={{ color: 'var(--theme-text-primary)' }}>Exam / Milestone</h4>
            <div className="text-3xl font-black flex items-baseline gap-1" style={{ color: 'var(--theme-text-primary)' }}>
              {stats?.daysRemaining !== null && stats?.daysRemaining !== undefined ? stats.daysRemaining : 0}
              <span className="text-xs font-bold opacity-70">Days Left</span>
            </div>
          </div>

          {/* 3D Calendar Graphic */}
          <div className="absolute right-2 bottom-2 w-14 h-14 opacity-40 pointer-events-none flex items-center justify-center">
            <Calendar className="w-10 h-10 text-amber-500" />
          </div>
        </div>

        {/* CARD 2: XP SCORE (Soft Lavender / Purple) */}
        <div className="p-4 rounded-3xl relative overflow-hidden border shadow-sm flex flex-col justify-between min-h-[145px]"
          style={{ 
            background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.18) 0%, rgba(129, 140, 248, 0.08) 100%)', 
            borderColor: 'rgba(168, 85, 247, 0.3)' 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-purple-500/20 text-purple-400 border border-purple-500/30">
              XP SCORE
            </span>
            <div className="w-7 h-7 rounded-full bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-purple-400" />
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Level {level} Competency</h4>
            <div className="text-3xl font-black flex items-baseline gap-1" style={{ color: 'var(--theme-text-primary)' }}>
              {xp}
              <span className="text-xs font-bold opacity-70">XP</span>
            </div>
            <p className="text-[10px] font-bold opacity-60 mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
              Tasks Completed: {completedCount}
            </p>
          </div>

          {/* 3D Bar Chart Graphic */}
          <div className="absolute right-2 bottom-2 w-14 h-14 opacity-40 pointer-events-none flex items-center justify-center">
            <BarChart3 className="w-10 h-10 text-purple-400" />
          </div>
        </div>

        {/* CARD 3: FOCUS STREAK (Soft Mint / Emerald) */}
        <div className="p-4 rounded-3xl relative overflow-hidden border shadow-sm flex flex-col justify-between min-h-[145px]"
          style={{ 
            background: 'linear-gradient(135deg, rgba(52, 211, 153, 0.18) 0%, rgba(16, 185, 129, 0.08) 100%)', 
            borderColor: 'rgba(52, 211, 153, 0.3)' 
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              FOCUS STREAK
            </span>
            <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
              <Flame className="w-3.5 h-3.5 text-emerald-400" />
            </div>
          </div>

          <div>
            <h4 className="font-extrabold text-sm mb-0.5" style={{ color: 'var(--theme-text-primary)' }}>Maintain Momentum</h4>
            <div className="text-3xl font-black flex items-baseline gap-1" style={{ color: 'var(--theme-text-primary)' }}>
              {streak}
              <span className="text-xs font-bold opacity-70">Days</span>
            </div>
            <p className="text-[10px] font-bold opacity-60 mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
              Active Consistency
            </p>
          </div>

          {/* 3D Plant Graphic */}
          <div className="absolute right-2 bottom-2 w-14 h-14 opacity-40 pointer-events-none flex items-center justify-center">
            <TrendingUp className="w-10 h-10 text-emerald-400" />
          </div>
        </div>

      </div>

      {/* CARD 3: FOCUS SESSION BANNER (Soft Pink/Coral Gradient with 25:00 timer clock graphic) */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
        className="p-5 md:p-6 rounded-3xl relative overflow-hidden border shadow-lg flex flex-col md:flex-row items-center justify-between gap-5"
        style={{ 
          background: 'linear-gradient(135deg, rgba(244, 114, 182, 0.18) 0%, rgba(236, 72, 153, 0.08) 60%, rgba(15, 23, 42, 0.6) 100%)', 
          borderColor: 'rgba(244, 114, 182, 0.3)' 
        }}
      >
        <div className="space-y-2.5 max-w-lg text-center md:text-left z-10">
          <span className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full bg-pink-500/20 text-pink-400 border border-pink-500/30 inline-block">
            FOCUS MODE
          </span>
          <h3 className="text-xl md:text-2xl font-black leading-tight" style={{ color: 'var(--theme-text-primary)' }}>
            Start a 25-Minute Focus Session
          </h3>
          <p className="text-xs opacity-75 leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
            Calibrate your focus patterns with Saathi AI recommendations to boost retention and finish today's high-priority quests effortlessly.
          </p>

          <div className="pt-1">
            <Link href="/pomodoro">
              <Button 
                size="lg"
                className="rounded-full px-7 font-extrabold text-white shadow-lg transition-transform hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #15803d 0%, #047857 100%)' }}
              >
                <Play className="w-4 h-4 mr-2 fill-white" />
                Launch Focus Timer
              </Button>
            </Link>
          </div>
        </div>

        {/* Right 3D Alarm Clock Illustration showing 25:00 */}
        <div className="shrink-0 relative z-10 flex items-center justify-center">
          <div className="w-32 h-32 rounded-full border-4 border-rose-500/50 bg-rose-950/40 backdrop-blur-md shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="w-2 h-2 rounded-full bg-rose-400 animate-ping mb-1" />
            <span className="text-2xl font-black text-rose-300 tracking-wider">25:00</span>
            <span className="text-[9px] font-bold opacity-60 text-rose-200">POMODORO</span>
          </div>
        </div>
      </motion.div>

      {/* CARD 4: SAATHI AI BANNER (Soft Gold / Cream Gradient) */}
      <div 
        onClick={() => window.dispatchEvent(new Event('open-saathi-chat'))}
        className="block cursor-pointer"
      >
        <motion.div 
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.98 }}
          className="p-4 rounded-2xl border shadow-sm flex items-center justify-between transition-all"
          style={{ 
            background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)', 
            borderColor: 'rgba(245, 158, 11, 0.3)' 
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
                Saathi AI
              </h4>
              <p className="text-[11px] font-bold text-amber-400">Active Sync</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-xl">
              🤖
            </div>
            <ChevronRight className="w-5 h-5 opacity-60" style={{ color: 'var(--theme-text-primary)' }} />
          </div>
        </motion.div>
      </div>

      {/* SECTION 5: TODAY'S HIGH PRIORITY QUESTS */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
            <ShieldCheck className="w-5 h-5 text-amber-500" />
            Today's High Priority Quests
          </h3>
          <Link href="/tasks" className="text-xs font-bold opacity-70 hover:opacity-100 flex items-center gap-1" style={{ color: 'var(--theme-text-primary)' }}>
            View All <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-2.5">
          {todayTasks.length > 0 ? todayTasks.map((task: any, i: number) => {
            const badge = getPriorityBadge(task.priority);
            const isCompleted = task.status === 'completed';
            return (
              <motion.div 
                key={task.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                className="p-3.5 rounded-2xl flex flex-wrap sm:flex-nowrap items-center justify-between gap-3 cursor-pointer border shadow-sm transition-all hover:scale-[1.005]"
                style={{ 
                  borderColor: 'var(--theme-border)', 
                  background: i === 0 
                    ? 'linear-gradient(90deg, rgba(244, 114, 182, 0.12) 0%, rgba(236, 72, 153, 0.04) 100%)'
                    : i === 1 
                      ? 'linear-gradient(90deg, rgba(96, 165, 250, 0.12) 0%, rgba(59, 130, 246, 0.04) 100%)'
                      : 'linear-gradient(90deg, rgba(52, 211, 153, 0.12) 0%, rgba(16, 185, 129, 0.04) 100%)'
                }}
                onClick={() => handleToggleTask(task.id)}
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <button className="shrink-0">
                    {isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    ) : (
                      <Circle className="w-5 h-5 opacity-40 hover:opacity-100" style={{ color: 'var(--theme-text-primary)' }} />
                    )}
                  </button>

                  <h4 className={`text-xs sm:text-sm font-bold truncate ${isCompleted ? 'line-through opacity-50' : ''}`} style={{ color: 'var(--theme-text-primary)' }}>
                    {task.title}
                  </h4>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider" style={{ background: badge.bg, color: badge.text }}>
                    {badge.label}
                  </span>

                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> +25 XP
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-bold text-amber-400">
                    <Star className="w-3 h-3 fill-amber-400" /> +25 XP
                  </div>
                </div>
              </motion.div>
            );
          }) : (
            <div className="p-6 rounded-2xl text-center glass-card border opacity-60 text-xs font-bold" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-background-alt)' }}>
              <CheckCircle2 className="w-6 h-6 mx-auto mb-1 text-emerald-400" />
              All quests completed for today!
            </div>
          )}
        </div>
      </div>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (Matches image exact bottom navigation) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950/90 backdrop-blur-xl border-t border-white/10 px-4 py-2 flex items-center justify-around">
        <Link href="/dashboard" className="flex flex-col items-center gap-1 text-amber-400">
          <Home className="w-5 h-5" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link href="/roadmap" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 text-white">
          <Map className="w-5 h-5" />
          <span className="text-[10px] font-bold">Roadmap</span>
        </Link>
        <Link href="/tasks" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 text-white">
          <CalendarDays className="w-5 h-5" />
          <span className="text-[10px] font-bold">Tasks</span>
        </Link>
        <Link href="/pomodoro" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 text-white">
          <Timer className="w-5 h-5" />
          <span className="text-[10px] font-bold">Focus</span>
        </Link>
        <Link href="/personalize" className="flex flex-col items-center gap-1 opacity-60 hover:opacity-100 text-white">
          <User className="w-5 h-5" />
          <span className="text-[10px] font-bold">Profile</span>
        </Link>
      </div>

    </div>
  );
}
