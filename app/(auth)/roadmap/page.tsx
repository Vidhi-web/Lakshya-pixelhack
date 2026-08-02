'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { 
  Target, CheckCircle2, Circle, Clock, Calendar as CalendarIcon, 
  AlertCircle, TrendingUp, Play, ChevronRight, Plus 
} from 'lucide-react';
import { format } from 'date-fns';
import toast, { Toaster } from 'react-hot-toast';

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
}

export default function RoadmapPage() {
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleModal, setScheduleModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
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
        setMilestones(milestonesData.milestones || []);
        setTasks(tasksData.tasks || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load roadmap');
    } finally {
      setLoading(false);
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

      // Create calendar event
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

      // Update task with event reference
      await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scheduled_event_id: eventData.event.id 
        }),
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-green-100 text-green-700 border-green-200';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent': return <AlertCircle className="w-4 h-4" />;
      case 'high': return <TrendingUp className="w-4 h-4" />;
      default: return <Circle className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-32">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600 dark:text-gray-400">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">AI Roadmap</h1>
          <p className="text-gray-600 dark:text-gray-400">Your personalized journey to achieve your goal</p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Vertical Line */}
          <div className="absolute left-8 top-0 bottom-0 w-1 bg-gray-200" />

          {milestones.map((milestone, idx) => {
            const milestoneTasks = tasks.filter(t => t.milestone_id === milestone.id);
            const completedCount = milestoneTasks.filter(t => t.status === 'completed').length;
            const progress = milestoneTasks.length > 0 
              ? Math.round((completedCount / milestoneTasks.length) * 100) 
              : 0;

            return (
              <div key={milestone.id} className="relative mb-12">
                {/* Milestone Node */}
                <div className="flex items-start gap-6">
                  {/* Timeline Icon */}
                  <div className={`relative z-10 w-16 h-16 rounded-full flex items-center justify-center shadow-lg ${
                    milestone.status === 'completed' 
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600' 
                      : milestone.status === 'in_progress'
                      ? 'bg-gradient-to-br from-blue-500 to-indigo-600'
                      : 'bg-white border-4 border-gray-300'
                  }`}>
                    {milestone.status === 'completed' ? (
                      <CheckCircle2 className="w-8 h-8 text-white" />
                    ) : milestone.status === 'in_progress' ? (
                      <Play className="w-6 h-6 text-white" />
                    ) : (
                      <span className="text-lg font-bold text-gray-400">{idx + 1}</span>
                    )}
                  </div>

                  {/* Milestone Card */}
                  <Card className="flex-1 border border-gray-200 shadow-md hover:shadow-lg transition">
                    <CardContent className="p-6">
                      {/* Milestone Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h2 className="text-2xl font-bold text-gray-900 mb-2">{milestone.title}</h2>
                          <p className="text-gray-600 mb-3">{milestone.description}</p>
                          <div className="flex items-center gap-4 text-sm">
                            {milestone.target_date && (
                              <span className="flex items-center gap-1 text-gray-500">
                                <Clock className="w-4 h-4" />
                                {format(new Date(milestone.target_date), 'MMM d, yyyy')}
                              </span>
                            )}
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              milestone.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                              milestone.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {milestone.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                        
                        {/* Progress Circle */}
                        <div className="text-center">
                          <div className="relative w-20 h-20">
                            <svg className="transform -rotate-90" width="80" height="80">
                              <circle cx="40" cy="40" r="36" fill="none" stroke="#e5e7eb" strokeWidth="6" />
                              <circle 
                                cx="40" 
                                cy="40" 
                                r="36" 
                                fill="none" 
                                stroke="#10b981" 
                                strokeWidth="6"
                                strokeLinecap="round"
                                strokeDasharray={`${2 * Math.PI * 36}`}
                                strokeDashoffset={`${2 * Math.PI * 36 * (1 - progress / 100)}`}
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-lg font-bold text-gray-900">{progress}%</span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">{completedCount}/{milestoneTasks.length}</p>
                        </div>
                      </div>

                      {/* Tasks Grid */}
                      {milestoneTasks.length > 0 && (
                        <div className="mt-6 pt-6 border-t border-gray-200">
                          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                            Tasks ({milestoneTasks.length})
                          </h3>
                          <div className="grid gap-3">
                            {milestoneTasks.map((task) => (
                              <div 
                                key={task.id}
                                className={`p-4 rounded-lg border transition hover:shadow-md ${
                                  task.status === 'completed' 
                                    ? 'bg-gray-50 border-gray-200' 
                                    : 'bg-white border-gray-300'
                                }`}
                              >
                                <div className="flex items-start gap-4">
                                  {/* Task Status */}
                                  <div className="flex-shrink-0 mt-1">
                                    {task.status === 'completed' ? (
                                      <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                                    ) : (
                                      <Circle className="w-6 h-6 text-gray-400" />
                                    )}
                                  </div>

                                  {/* Task Details */}
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-4 mb-2">
                                      <h4 className={`font-semibold ${
                                        task.status === 'completed' ? 'line-through text-gray-500' : 'text-gray-900'
                                      }`}>
                                        {task.title}
                                      </h4>
                                      
                                      {/* Schedule Actions */}
                                      <div className="flex items-center gap-2 flex-shrink-0">
                                        {task.scheduled_event_id ? (
                                          <>
                                            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 flex items-center gap-1">
                                              <CalendarIcon className="w-3 h-3" />
                                              Scheduled
                                            </span>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleUnschedule(task)}
                                              className="h-8 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
                                            >
                                              Remove
                                            </Button>
                                          </>
                                        ) : (
                                          <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleScheduleTask(task)}
                                            className="h-8 text-xs border-blue-600 text-blue-600 hover:bg-blue-50"
                                          >
                                            <CalendarIcon className="w-3 h-3 mr-1" />
                                            Schedule
                                          </Button>
                                        )}
                                      </div>
                                    </div>

                                    <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                                    {/* Task Metadata */}
                                    <div className="flex flex-wrap gap-2">
                                      <span className={`text-xs px-2 py-1 rounded-full border flex items-center gap-1 ${getPriorityColor(task.priority)}`}>
                                        {getPriorityIcon(task.priority)}
                                        {task.priority}
                                      </span>
                                      {task.estimated_hours && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700">
                                          ~{task.estimated_hours}h
                                        </span>
                                      )}
                                      {task.due_date && (
                                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 flex items-center gap-1">
                                          <Clock className="w-3 h-3" />
                                          Due {format(new Date(task.due_date), 'MMM d')}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {milestones.length === 0 && (
          <Card className="border border-gray-200">
            <CardContent className="py-16 text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Roadmap Yet</h3>
              <p className="text-gray-600 mb-4">Generate your AI roadmap from the Goals page</p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Schedule Confirmation Modal */}
      <Dialog open={scheduleModal} onOpenChange={setScheduleModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Schedule Task to Calendar</DialogTitle>
            <DialogDescription>
              Choose when you want to work on this task
            </DialogDescription>
          </DialogHeader>

          {selectedTask && (
            <div className="space-y-4 py-4">
              <div className="p-3 rounded-lg bg-gray-50 border border-gray-200">
                <p className="font-semibold text-sm text-gray-900">{selectedTask.title}</p>
                <p className="text-xs text-gray-600 mt-1">{selectedTask.description}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                <Input
                  type="date"
                  value={scheduleData.date}
                  onChange={(e) => setScheduleData({ ...scheduleData, date: e.target.value })}
                  className="border-gray-300"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <Input
                    type="time"
                    value={scheduleData.start_time}
                    onChange={(e) => setScheduleData({ ...scheduleData, start_time: e.target.value })}
                    className="border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="0.5"
                    value={scheduleData.duration}
                    onChange={(e) => setScheduleData({ ...scheduleData, duration: parseFloat(e.target.value) })}
                    className="border-gray-300"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="p-3 rounded-lg bg-blue-50 border border-blue-200">
                <p className="text-xs font-medium text-blue-900 mb-1">Calendar Event Preview:</p>
                <p className="text-sm text-blue-700">
                  {scheduleData.date && format(new Date(scheduleData.date), 'MMM d, yyyy')} at {scheduleData.start_time}
                  <br />
                  Duration: {scheduleData.duration} hour{scheduleData.duration !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleModal(false)}>
              Cancel
            </Button>
            <Button onClick={confirmSchedule} className="bg-blue-600 hover:bg-blue-700 text-white">
              <CalendarIcon className="w-4 h-4 mr-2" />
              Schedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
