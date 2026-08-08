'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, Clock, Circle, CheckCircle2, Calendar as CalendarIcon, Star, Trophy, Sparkles, Zap, Award } from 'lucide-react';
import { format } from 'date-fns';
import toast from 'react-hot-toast';

export function MilestoneDrawer({ 
  milestone, 
  tasks, 
  onClose, 
  onScheduleTask, 
  onUnscheduleTask,
  onToggleTask,
}: any) {
  if (!milestone) return null;

  const completedCount = tasks.filter((t: any) => t.status === 'completed').length;
  const totalCount = tasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const isLevelCompleted = progressPercent >= 100 || milestone.status === 'completed';

  return (
    <AnimatePresence>
      <motion.div 
        key="milestone-overlay"
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        exit={{ opacity: 0 }} 
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      />
      <motion.div
        key="milestone-panel"
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 z-50 w-full max-w-md h-full overflow-y-auto shadow-2xl flex flex-col"
        style={{ 
          background: 'var(--theme-background)', 
          borderLeft: '1px solid var(--theme-border)',
          color: 'var(--theme-text-primary)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-background-alt)' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full"
              style={{ background: 'var(--theme-surface)', color: 'var(--theme-accent)', border: '1px solid var(--theme-border)' }}
            >
              {milestone.isBoss ? '⚔️ Boss Battle Level' : `Level ${milestone.order_index + 1}`}
            </span>
            <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 transition" style={{ color: 'var(--theme-text-primary)' }}>
              <X className="w-5 h-5" />
            </button>
          </div>

          <h2 className="text-2xl font-extrabold flex items-center gap-2 mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            {milestone.title} {milestone.isBoss && '⚔️'}
          </h2>
          <p className="text-xs opacity-75 leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
            {milestone.description}
          </p>

          {/* Level Progress Bar */}
          <div className="mt-4 p-3.5 rounded-xl glass-card border" style={{ borderColor: 'var(--theme-border)' }}>
            <div className="flex items-center justify-between text-xs font-bold mb-2">
              <span className="flex items-center gap-1.5" style={{ color: 'var(--theme-text-primary)' }}>
                <Trophy className="w-4 h-4 text-yellow-400" />
                Level Progress
              </span>
              <span style={{ color: isLevelCompleted ? '#10b981' : 'var(--theme-accent)' }}>
                {completedCount}/{totalCount} Tasks ({progressPercent}%)
              </span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
              <motion.div 
                className="h-full rounded-full"
                style={{ background: isLevelCompleted ? '#10b981' : 'var(--theme-accent)' }}
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>

          {/* Level Cleared Reward Banner */}
          {isLevelCompleted && (
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 p-3 rounded-xl flex items-center justify-between bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/40 text-emerald-400"
            >
              <div className="flex items-center gap-2 text-xs font-extrabold">
                <Sparkles className="w-4 h-4" />
                <span>Level Cleared! +100 Bonus XP & Badge Unlocked 🏆</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quest / Task List */}
        <div className="p-6 space-y-4 flex-1 overflow-y-auto custom-scrollbar">
          <h3 className="text-xs font-extrabold uppercase tracking-wider opacity-60 flex items-center gap-1.5" style={{ color: 'var(--theme-text-primary)' }}>
            <Zap className="w-4 h-4 text-yellow-400" />
            Level Quests ({totalCount})
          </h3>

          {tasks.length === 0 ? (
            <div className="text-center py-10 opacity-50 text-sm" style={{ color: 'var(--theme-text-primary)' }}>
              No quests in this level yet.
            </div>
          ) : (
            tasks.map((task: any, index: number) => {
              const isDone = task.status === 'completed';
              return (
                <motion.div 
                  key={task.id || `task-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="glass-card p-4 rounded-xl border transition-all hover:border-white/20"
                  style={{ borderColor: 'var(--theme-border)' }}
                >
                  <div className="flex items-start gap-3">
                    {/* Checkbox Button */}
                    <button 
                      onClick={() => onToggleTask && onToggleTask(task)}
                      className="mt-0.5 shrink-0 hover:scale-110 transition-transform"
                    >
                      {isDone ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 opacity-40 hover:opacity-100" style={{ color: 'var(--theme-text-primary)' }} />
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 
                          className={`font-bold text-sm truncate ${isDone ? 'line-through opacity-50' : ''}`}
                          style={{ color: 'var(--theme-text-primary)' }}
                        >
                          {task.title}
                        </h4>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold shrink-0" style={{ background: 'rgba(250,204,21,0.15)', color: '#facc15' }}>
                          <Star className="w-3 h-3" /> +25 XP
                        </div>
                      </div>

                      {task.description && (
                        <p className="text-xs opacity-70 line-clamp-2 mb-3" style={{ color: 'var(--theme-text-primary)' }}>
                          {task.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase" style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                          {task.priority}
                        </span>
                        {task.estimated_hours && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border" style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                            ~{task.estimated_hours}h
                          </span>
                        )}
                        {task.due_date && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border flex items-center gap-1" style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
                            <Clock className="w-3 h-3" /> {format(new Date(task.due_date), 'MMM d')}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {task.scheduled_event_id ? (
                          <button 
                            onClick={() => onUnscheduleTask(task)} 
                            className="text-xs px-3 py-1.5 rounded-lg font-bold bg-red-500/20 text-red-400 hover:bg-red-500/30 transition"
                          >
                            Unschedule
                          </button>
                        ) : (
                          <button 
                            onClick={() => onScheduleTask(task)} 
                            className="text-xs px-3 py-1.5 rounded-lg font-bold border transition flex items-center gap-1"
                            style={{ background: 'var(--theme-surface)', color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                          >
                            <CalendarIcon className="w-3 h-3" /> Schedule to Calendar
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
