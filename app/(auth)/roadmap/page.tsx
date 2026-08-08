'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Target, CalendarIcon, Sparkles, Trophy, Star, Award, Compass, RefreshCw, Zap } from 'lucide-react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';
import { GameMap } from '@/components/roadmap/game-map';
import { MilestoneDrawer } from '@/components/roadmap/milestone-drawer';

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'todo' | 'in_progress' | 'completed';
  estimated_hours?: number;
  due_date?: string;
  milestone_id: string;
  scheduled_event_id?: string;
}

interface Milestone {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in_progress' | 'completed';
  target_date?: string;
  order_index: number;
  isBoss?: boolean;
}

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<Milestone | null>(null);
  const [levelRewardModal, setLevelRewardModal] = useState<any>(null);

  const [scheduleData, setScheduleData] = useState({
    date: '',
    start_time: '09:00',
    duration: 2,
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [milestonesRes, tasksRes] = await Promise.all([
        fetch('/api/milestones'),
        fetch('/api/tasks'),
      ]);

      if (milestonesRes.ok && tasksRes.ok) {
        const milestonesData = await milestonesRes.json();
        const tasksData = await tasksRes.json();
        
        let fetchedMilestones = milestonesData.milestones || [];
        if (fetchedMilestones.length > 0) {
          fetchedMilestones[fetchedMilestones.length - 1].isBoss = true;
        }
        setMilestones(fetchedMilestones);
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTask = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    // Optimistic UI update
    const updatedTasks = tasks.map(t => t.id === task.id ? { ...t, status: newStatus as any } : t);
    setTasks(updatedTasks);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error();

      // Check if all tasks in this milestone are now completed
      const mTasks = updatedTasks.filter(t => t.milestone_id === task.milestone_id);
      const allDone = mTasks.every(t => t.status === 'completed');

      if (allDone && newStatus === 'completed') {
        const targetMilestone = milestones.find(m => m.id === task.milestone_id);
        if (targetMilestone) {
          // Update milestone status on backend
          await fetch('/api/milestones', {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: targetMilestone.id, status: 'completed' }),
          });

          // Show celebration modal
          setLevelRewardModal(targetMilestone);
          fetchData();
        }
      } else {
        toast.success(newStatus === 'completed' ? 'Quest Completed! +25 XP ⭐' : 'Quest reopened');
      }
    } catch (e) {
      toast.error('Failed to update task status');
      fetchData();
    }
  };

  const handleGenerateRoadmap = async () => {
    setGenerating(true);
    try {
      // First, get the user's active goal type from milestones/tasks API or directly
      const goalRes = await fetch('/api/milestones');
      let goalType = 'placement'; // fallback
      
      if (goalRes.ok) {
        const goalData = await goalRes.json();
        if (goalData.goalType) {
          goalType = goalData.goalType;
        }
      }
      
      const res = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ goalType }),
      });
      if (res.ok) {
        toast.success('AI Roadmap created!');
        await fetchData();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(errorData.error || 'Failed to generate roadmap');
      }
    } catch (error) {
      toast.error('Error generating roadmap');
    } finally {
      setGenerating(false);
    }
  };

  const handleScheduleTask = (task: Task) => {
    setSelectedTask(task);
    const today = new Date().toISOString().split('T')[0];
    setScheduleData({
      date: task.due_date?.split('T')[0] || today,
      start_time: '09:00',
      duration: task.estimated_hours || 2,
    });
    setScheduleModal(true);
  };

  const confirmSchedule = async () => {
    if (!selectedTask) return;

    try {
      const startDateTime = new Date(`${scheduleData.date}T${scheduleData.start_time}`);
      const endDateTime = new Date(startDateTime.getTime() + scheduleData.duration * 60 * 60 * 1000);

      const eventRes = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTask.title,
          description: selectedTask.description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          color: '#f59e0b',
          event_type: 'task',
          task_id: selectedTask.id,
        }),
      });

      if (!eventRes.ok) throw new Error('Failed to create event');

      const eventData = await eventRes.json();

      await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_event_id: eventData.event.id }),
      });

      toast.success('Task scheduled to calendar!');
      setScheduleModal(false);
      fetchData();
    } catch (error) {
      console.error('Error scheduling task:', error);
      toast.error('Failed to schedule task');
    }
  };

  const handleUnschedule = async (task: Task) => {
    if (!task.scheduled_event_id) return;
    if (!confirm('Remove this task from calendar?')) return;

    try {
      await fetch(`/api/events/${task.scheduled_event_id}`, { method: 'DELETE' });
      await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduled_event_id: null }),
      });

      toast.success('Task unscheduled');
      fetchData();
    } catch (error) {
      toast.error('Failed to unschedule task');
    }
  };
  
  const progressMap = milestones.reduce((acc, m) => {
    const mTasks = tasks.filter(t => t.milestone_id === m.id);
    const completed = mTasks.filter(t => t.status === 'completed').length;
    acc[m.id] = mTasks.length > 0 ? Math.round((completed / mTasks.length) * 100) : 0;
    return acc;
  }, {} as Record<string, number>);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Loading island map...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold flex items-center gap-2 mb-1" style={{ color: 'var(--theme-text-primary)' }}>
              <Compass className="w-8 h-8 text-[var(--theme-accent)]" />
              AI Island Roadmap
            </h1>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
              Conquer islands level-by-level to unlock rewards and achieve your goal!
            </p>
          </div>

          <Button 
            onClick={handleGenerateRoadmap}
            disabled={generating}
            className="font-bold text-white shadow-lg rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            {generating ? 'Regenerating...' : 'Regenerate Roadmap'}
          </Button>
        </div>

        {milestones.length === 0 ? (
          <div className="glass-card p-16 text-center rounded-3xl border" style={{ borderColor: 'var(--theme-border)' }}>
            <Target className="w-16 h-16 opacity-30 mx-auto mb-4" style={{ color: 'var(--theme-accent)' }} />
            <h3 className="text-xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>No Roadmap Yet</h3>
            <p className="text-sm opacity-60 mb-6 max-w-md mx-auto" style={{ color: 'var(--theme-text-primary)' }}>
              Generate your AI-powered island roadmap based on your active goal to start your gamified learning quest.
            </p>
            <Button 
              onClick={handleGenerateRoadmap}
              disabled={generating}
              className="font-bold text-white px-8 py-3 rounded-xl shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
            >
              {generating ? 'Generating...' : '🚀 Generate AI Roadmap'}
            </Button>
          </div>
        ) : (
          <GameMap 
            milestones={milestones}
            progressMap={progressMap}
            onNodeClick={(m) => setSelectedMilestone(m)}
          />
        )}
      </div>

      {/* Selected Level Drawer */}
      {selectedMilestone && (
        <MilestoneDrawer
          key={selectedMilestone.id}
          milestone={selectedMilestone}
          tasks={tasks.filter(t => t.milestone_id === selectedMilestone.id)}
          onClose={() => setSelectedMilestone(null)}
          onScheduleTask={handleScheduleTask}
          onUnscheduleTask={handleUnschedule}
          onToggleTask={handleToggleTask}
        />
      )}

      {/* Level Reward Celebration Modal */}
      <AnimatePresence>
        {levelRewardModal && (
          <div className="fixed inset-0 bg-black/75 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="w-full max-w-md glass-card border rounded-3xl p-8 text-center shadow-2xl relative overflow-hidden"
              style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-text-primary)' }}
            >
              <div className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-4xl shadow-xl bg-gradient-to-br from-amber-400 to-orange-600 text-white">
                🏆
              </div>

              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full text-amber-400 bg-amber-400/10 border border-amber-400/30 mb-2 inline-block">
                Level Cleared! 🎉
              </span>

              <h2 className="text-2xl font-black mt-2 mb-2" style={{ color: 'var(--theme-text-primary)' }}>
                {levelRewardModal.title}
              </h2>

              <p className="text-xs opacity-75 mb-6" style={{ color: 'var(--theme-text-primary)' }}>
                You completed all quests in this level and unlocked the next island!
              </p>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <div className="p-3 rounded-2xl glass-card border" style={{ borderColor: 'var(--theme-border)' }}>
                  <Zap className="w-5 h-5 text-yellow-400 mx-auto mb-1" />
                  <div className="text-lg font-black text-amber-400">+100 XP</div>
                  <div className="text-[10px] opacity-60 uppercase font-bold">Level Bonus</div>
                </div>
                <div className="p-3 rounded-2xl glass-card border" style={{ borderColor: 'var(--theme-border)' }}>
                  <Award className="w-5 h-5 text-emerald-400 mx-auto mb-1" />
                  <div className="text-lg font-black text-emerald-400">Badge</div>
                  <div className="text-[10px] opacity-60 uppercase font-bold">Island Master</div>
                </div>
              </div>

              <Button 
                onClick={() => setLevelRewardModal(null)}
                className="w-full font-extrabold text-white py-3 rounded-xl shadow-lg"
                style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
              >
                Claim Reward & Continue 🚀
              </Button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Confirmation Modal */}
      <Dialog open={scheduleModal} onOpenChange={setScheduleModal}>
        <DialogContent className="sm:max-w-md glass-card border rounded-2xl shadow-2xl" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
          <DialogHeader>
            <DialogTitle style={{ color: 'var(--theme-text-primary)' }}>Schedule Task to Calendar</DialogTitle>
            <DialogDescription className="opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
              Choose when you want to work on this task
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-xl glass-card border" style={{ borderColor: 'var(--theme-border)' }}>
                <p className="font-bold text-sm" style={{ color: 'var(--theme-text-primary)' }}>{selectedTask.title}</p>
                <p className="text-xs opacity-70 mt-1" style={{ color: 'var(--theme-text-primary)' }}>{selectedTask.description}</p>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Date</label>
                <Input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="rounded-xl"
                  style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Start Time</label>
                  <Input
                    type="time"
                    value={scheduleData.start_time}
                    onChange={(e) => setScheduleData({ ...scheduleData, start_time: e.target.value })}
                    className="rounded-xl"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Duration (hours)</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({ ...scheduleData, duration: parseFloat(e.target.value) })}
                    className="rounded-xl"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModal(false)} className="rounded-xl" style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}>
              Cancel
            </Button>
            <Button onClick={confirmSchedule} className="font-bold text-white rounded-xl" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
