'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Lock, Play, Star, Trophy, Sparkles, ShieldAlert, Award, Compass, Zap, ArrowRight } from 'lucide-react';

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  target_date?: string;
  order_index: number;
  isBoss?: boolean;
}

interface GameMapProps {
  milestones: Milestone[];
  progressMap: Record<string, number>;
  onNodeClick: (milestone: Milestone) => void;
}

// Season / World Themes for Islands
const ISLAND_SEASONS = [
  {
    name: 'Spring Blossom Island',
    season: 'Spring',
    emoji: '🌸',
    badge: 'Blossom Explorer 🌸',
    icon: '🌱',
    accentColor: '#10b981',
  },
  {
    name: 'Summer Oasis Isle',
    season: 'Summer',
    emoji: '🌴',
    badge: 'Oasis Master 🌴',
    icon: '☀️',
    accentColor: '#f59e0b',
  },
  {
    name: 'Autumn Ember Island',
    season: 'Autumn',
    emoji: '🍂',
    badge: 'Ember Scholar 🍂',
    icon: '🍁',
    accentColor: '#f43f5e',
  },
  {
    name: 'Mystic Aurora Summit (Boss)',
    season: 'Winter Boss',
    emoji: '❄️⚔️',
    badge: 'Grand Champion 🏆',
    icon: '👑',
    accentColor: '#a855f7',
  },
];

export function GameMap({ milestones, progressMap, onNodeClick }: GameMapProps) {
  // Sort milestones by order index
  const sortedMilestones = [...milestones].sort((a, b) => a.order_index - b.order_index);

  // Determine lock status based on Duolingo rule:
  // Level 1 is always unlocked. Level N is unlocked ONLY IF Level N-1 is completed.
  const milestoneStatuses = sortedMilestones.map((m, idx) => {
    if (idx === 0) {
      return { ...m, isUnlocked: true };
    }
    const prevCompleted = sortedMilestones[idx - 1].status === 'completed' || (progressMap[sortedMilestones[idx - 1].id] || 0) >= 100;
    return {
      ...m,
      isUnlocked: prevCompleted,
    };
  });

  const activeLevelIndex = milestoneStatuses.findIndex(m => m.status !== 'completed' && m.isUnlocked);
  const currentActiveIdx = activeLevelIndex !== -1 ? activeLevelIndex : milestoneStatuses.length - 1;

  const activeSeason = ISLAND_SEASONS[Math.min(currentActiveIdx, ISLAND_SEASONS.length - 1)];

  return (
    <div className="relative w-full rounded-3xl overflow-hidden border shadow-2xl p-6 md:p-12 transition-all duration-700 glass-card"
      style={{
        background: 'var(--theme-background-alt)',
        borderColor: 'var(--theme-border)',
        color: 'var(--theme-text-primary)'
      }}
    >
      {/* Animated Dynamic Ocean Background with Theme Tint */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute inset-0 opacity-20 transition-all duration-1000"
          style={{ background: 'radial-gradient(ellipse at top, var(--theme-accent), transparent 70%)' }} 
        />
        
        {/* Animated Water Waves / Ripples */}
        <motion.div 
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(circle at 50% 50%, var(--theme-primary) 0%, transparent 60%)',
          }}
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 40,
            repeat: Infinity,
            ease: 'linear',
          }}
        />

        {/* Floating sparkles / bubbles */}
        {Array.from({ length: 15 }).map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full blur-[1px]"
            style={{
              width: Math.random() * 8 + 4,
              height: Math.random() * 8 + 4,
              left: `${(i * 7) % 100}%`,
              top: `${(i * 13) % 100}%`,
              background: 'var(--theme-accent)',
            }}
            animate={{
              y: [0, -30, 0],
              x: [0, 15, 0],
              opacity: [0.1, 0.4, 0.1],
            }}
            transition={{
              duration: 4 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
            }}
          />
        ))}
      </div>

      {/* World Map Header & Season Indicator */}
      <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 mb-10 pb-6 border-b" style={{ borderColor: 'var(--theme-border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-lg border glass-card" style={{ borderColor: 'var(--theme-border)' }}>
            {activeSeason.emoji}
          </div>
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full border" 
              style={{ background: 'var(--theme-surface)', color: 'var(--theme-accent)', borderColor: 'var(--theme-border)' }}
            >
              Current Realm • {activeSeason.season}
            </span>
            <h2 className="text-xl font-extrabold mt-1 flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
              {activeSeason.name}
            </h2>
          </div>
        </div>

        {/* Progress Tracker */}
        <div className="flex items-center gap-4 glass-card px-5 py-2.5 rounded-2xl border" style={{ borderColor: 'var(--theme-border)' }}>
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-yellow-400" />
            <span className="text-xs font-bold" style={{ color: 'var(--theme-text-primary)' }}>
              {milestoneStatuses.filter(m => m.status === 'completed' || (progressMap[m.id] || 0) >= 100).length} / {milestones.length} Islands Conquered
            </span>
          </div>
        </div>
      </div>

      {/* Winding Island Path (Duolingo & Candy Crush style) */}
      <div className="relative z-10 max-w-3xl mx-auto py-8">
        <div className="flex flex-col items-center gap-16 relative">
          
          {milestoneStatuses.map((milestone, idx) => {
            const progress = progressMap[milestone.id] || 0;
            const isCompleted = milestone.status === 'completed' || progress >= 100;
            const isCurrent = idx === currentActiveIdx;
            const isLocked = !milestone.isUnlocked && !isCompleted;
            const seasonTheme = ISLAND_SEASONS[Math.min(idx, ISLAND_SEASONS.length - 1)];

            const alignClass = idx % 2 === 0 ? 'md:self-start md:ml-12' : 'md:self-end md:mr-12';

            return (
              <div key={milestone.id} className={`relative flex flex-col items-center ${alignClass} w-full md:w-auto`}>
                
                {/* Connecting Dotted Bridge / Path to Next Island */}
                {idx < milestoneStatuses.length - 1 && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 h-16 w-1 flex flex-col items-center justify-around pointer-events-none z-0">
                    <motion.div 
                      className="w-2 h-2 rounded-full"
                      style={{ background: isCompleted ? '#10b981' : 'var(--theme-border)' }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full"
                      style={{ background: isCompleted ? '#10b981' : 'var(--theme-border)' }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 + 0.3 }}
                    />
                    <motion.div 
                      className="w-2 h-2 rounded-full"
                      style={{ background: isCompleted ? '#10b981' : 'var(--theme-border)' }}
                      animate={{ scale: [1, 1.4, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, delay: idx * 0.2 + 0.6 }}
                    />
                  </div>
                )}

                {/* Island Node */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.15 }}
                  whileHover={!isLocked ? { scale: 1.06, y: -5 } : {}}
                  whileTap={!isLocked ? { scale: 0.95 } : {}}
                  onClick={() => {
                    if (!isLocked) onNodeClick(milestone);
                  }}
                  className={`relative flex flex-col items-center cursor-pointer group z-10 ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
                >
                  {/* Floating Island Base Glow */}
                  <div 
                    className={`absolute -inset-4 rounded-full blur-xl transition-all duration-500 ${
                      isCompleted ? 'bg-emerald-500/20' : isCurrent ? 'bg-amber-500/30 animate-pulse' : 'bg-transparent'
                    }`} 
                  />

                  {/* Level Number Badge / Crown */}
                  <div className="absolute -top-4 z-20 flex items-center gap-1 px-3 py-0.5 rounded-full text-xs font-black text-white shadow-lg border border-white/20"
                    style={{
                      background: isCompleted ? '#10b981' : isCurrent ? '#f59e0b' : '#64748b',
                    }}
                  >
                    {milestone.isBoss ? '⚔️ BOSS' : `LEVEL ${idx + 1}`}
                  </div>

                  {/* Island Button Sphere */}
                  <div className={`relative w-24 h-24 md:w-28 md:h-28 rounded-full flex flex-col items-center justify-center p-2 shadow-2xl transition-all border-4 ${
                    isCompleted 
                      ? 'border-emerald-500 shadow-emerald-500/30 bg-emerald-700/80 text-white' 
                      : isCurrent 
                        ? 'border-amber-400 shadow-amber-500/40 bg-amber-600/80 text-white' 
                        : 'border-slate-500 bg-slate-800/80 text-white'
                  }`}>
                    {/* Active Pulsing Ring */}
                    {isCurrent && (
                      <motion.div 
                        className="absolute -inset-2 rounded-full border-2 border-amber-400/80"
                        animate={{ scale: [1, 1.15, 1], opacity: [0.8, 0, 0.8] }}
                        transition={{ repeat: Infinity, duration: 1.8 }}
                      />
                    )}

                    {/* Icon Inside Island */}
                    <div className="text-3xl mb-1">
                      {isCompleted ? '🏆' : isLocked ? '🔒' : milestone.isBoss ? '🐲' : seasonTheme.icon}
                    </div>

                    <div className="text-[10px] font-extrabold uppercase text-white tracking-wider">
                      {isCompleted ? 'Cleared' : isLocked ? 'Locked' : `${progress}%`}
                    </div>
                  </div>

                  {/* Island Card Label */}
                  <div className="mt-3 p-4 rounded-2xl glass-card border text-center max-w-[220px] transition-all group-hover:border-white/30"
                    style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
                  >
                    <h4 className="font-bold text-sm line-clamp-1 mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                      {milestone.title}
                    </h4>
                    <p className="text-[11px] opacity-70 line-clamp-1" style={{ color: 'var(--theme-text-primary)' }}>
                      {milestone.description || 'Level tasks inside'}
                    </p>

                    {/* Progress Bar inside Card */}
                    <div className="mt-2.5 flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
                        <motion.div 
                          className="h-full rounded-full"
                          style={{
                            width: `${progress}%`,
                            background: isCompleted ? '#10b981' : 'var(--theme-accent)',
                          }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <span className="text-[10px] font-bold opacity-80" style={{ color: 'var(--theme-text-primary)' }}>{progress}%</span>
                    </div>

                    {/* Locked Message */}
                    {isLocked && (
                      <div className="mt-2 text-[10px] font-semibold text-amber-500 flex items-center justify-center gap-1">
                        <Lock className="w-3 h-3" /> Complete Level {idx} first
                      </div>
                    )}
                  </div>

                </motion.div>
              </div>
            );
          })}

        </div>
      </div>
    </div>
  );
}
