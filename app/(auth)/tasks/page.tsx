'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  CheckCircle2, Circle, Clock, Trash2, Edit2, Plus, 
  Search, Filter, ArrowUpDown, AlertCircle, Calendar as CalendarIcon
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast, { Toaster } from 'react-hot-toast';

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  due_date?: string;
  estimated_hours?: number;
  actual_hours?: number;
  tags?: string[];
  created_at: string;
  goal_id?: string;
}

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [error, setError] = useState('');
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium' as Task['priority'],
    due_date: '',
    estimated_hours: '',
  });

  const supabase = createClient();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filterStatus, searchQuery]);

  const fetchTasks = async () => {
    try {
      const response = await fetch('/api/tasks');
      const data = await response.json();
      
      if (response.ok) {
        setTasks(data.tasks || []);
      } else {
        setError(data.error || 'Failed to fetch tasks');
      }
    } catch (err) {
      setError('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    // Filter by status
    if (filterStatus !== 'all') {
      filtered = filtered.filter(task => task.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(task =>
        task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        task.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async () => {
    try {
      setError('');
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || null,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTasks([data.task, ...tasks]);
        setIsCreateModalOpen(false);
        resetForm();
      } else {
        setError(data.error || 'Failed to create task');
      }
    } catch (err) {
      setError('Failed to create task');
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;

    try {
      setError('');
      const response = await fetch(`/api/tasks/${selectedTask.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: formData.title,
          description: formData.description,
          priority: formData.priority,
          due_date: formData.due_date || null,
          estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(tasks.map(t => t.id === selectedTask.id ? data.task : t));
        setIsEditModalOpen(false);
        setSelectedTask(null);
        resetForm();
      } else {
        setError(data.error || 'Failed to update task');
      }
    } catch (err) {
      setError('Failed to update task');
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const newStatus = task.status === 'completed' ? 'todo' : 'completed';
    
    try {
      const response = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await response.json();

      if (response.ok) {
        setTasks(tasks.map(t => t.id === task.id ? data.task : t));
        if (newStatus === 'completed') {
          toast.success('🎉 Quest Completed! +25 XP ⭐', { id: `task-${task.id}` });
        } else {
          toast.success('Quest reopened', { id: `task-${task.id}` });
        }
      }
    } catch (err) {
      console.error('Failed to toggle task status');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return;

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setTasks(tasks.filter(t => t.id !== taskId));
      }
    } catch (err) {
      console.error('Failed to delete task');
    }
  };

  const handleScheduleToCalendar = async (task: Task) => {
    try {
      // Create a calendar event from the task
      const dueDate = task.due_date ? new Date(task.due_date) : new Date();
      const startTime = new Date(dueDate);
      startTime.setHours(9, 0, 0, 0); // Default to 9 AM
      
      const endTime = new Date(startTime);
      const hours = task.estimated_hours || 1;
      endTime.setHours(startTime.getHours() + Math.floor(hours));
      endTime.setMinutes(startTime.getMinutes() + (hours % 1) * 60);

      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: task.title,
          description: task.description || '',
          start_time: startTime.toISOString(),
          end_time: endTime.toISOString(),
          event_type: 'task',
          color: '#f59e0b',
          task_id: task.id,
          goal_id: task.goal_id,
        }),
      });

      if (response.ok) {
        alert('Task scheduled to calendar successfully!');
      } else {
        alert('Failed to schedule task to calendar');
      }
    } catch (err) {
      console.error('Failed to schedule task:', err);
      alert('Failed to schedule task to calendar');
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date || '',
      estimated_hours: task.estimated_hours?.toString() || '',
    });
    setIsEditModalOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      due_date: '',
      estimated_hours: '',
    });
  };

  const getPriorityColor = (priority: Task['priority']) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-700 border-red-300 dark:bg-red-900 dark:text-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-900 dark:text-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-300';
      case 'low': return 'bg-green-100 text-green-700 border-green-300 dark:bg-green-900 dark:text-green-300';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
              Tasks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your tasks and track your progress
            </p>
          </div>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Task
          </Button>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={filterStatus} onValueChange={(val) => setFilterStatus(val || 'all')}>
                <SelectTrigger className="w-full md:w-48">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Tasks</SelectItem>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Tasks List */}
        {filteredTasks.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {filterStatus !== 'all' || searchQuery
                  ? 'Try adjusting your filters'
                  : 'Create your first task to get started'}
              </p>
              {filterStatus === 'all' && !searchQuery && (
                <Button onClick={() => setIsCreateModalOpen(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Task
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTasks.map((task) => (
              <Card
                key={task.id}
                className={`transition-all hover:shadow-lg ${
                  task.status === 'completed' ? 'opacity-60' : ''
                }`}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => handleToggleStatus(task)}
                      className="mt-1 flex-shrink-0"
                    >
                      {task.status === 'completed' ? (
                        <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                      ) : (
                        <Circle className="w-6 h-6 text-gray-400 hover:text-emerald-600 transition-colors" />
                      )}
                    </button>

                    {/* Task Content */}
                    <div className="flex-1 min-w-0">
                      <h3
                        className={`font-semibold text-lg mb-1 ${
                          task.status === 'completed' ? 'line-through text-gray-500' : ''
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                          {task.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        <span
                          className={`text-xs px-2 py-1 rounded-full border ${getPriorityColor(
                            task.priority
                          )}`}
                        >
                          {task.priority}
                        </span>
                        {task.due_date && (
                          <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(task.due_date).toLocaleDateString()}
                          </span>
                        )}
                        {task.estimated_hours && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                            ~{task.estimated_hours}h
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleScheduleToCalendar(task)}
                        title="Schedule to Calendar"
                        className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                      >
                        <CalendarIcon className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(task)}
                      >
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Create Task Modal */}
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="Task description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="estimated_hours">Estimated Hours</Label>
                  <Input
                    id="estimated_hours"
                    type="number"
                    step="0.5"
                    placeholder="5"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="due_date">Due Date</Label>
                <Input
                  id="due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleCreateTask}
                disabled={!formData.title.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                Create Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Edit Task Modal */}
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Task</DialogTitle>
              <DialogDescription>
                Update task details
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  placeholder="Task title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  placeholder="Task description (optional)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="edit-estimated_hours">Estimated Hours</Label>
                  <Input
                    id="edit-estimated_hours"
                    type="number"
                    step="0.5"
                    placeholder="5"
                    value={formData.estimated_hours}
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="edit-due_date">Due Date</Label>
                <Input
                  id="edit-due_date"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleUpdateTask}
                disabled={!formData.title.trim()}
                className="bg-gradient-to-r from-emerald-600 to-teal-600"
              >
                Update Task
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
