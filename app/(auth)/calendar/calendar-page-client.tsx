'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday, isSameDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Clock, Plus, CheckCircle2, Circle } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { 'en-US': enUS };
const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  color?: string;
  event_type?: string;
  task_id?: string;
  status?: string;
}

export default function CalendarPageClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showModal, setShowModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start: '',
    end: '',
    color: '#3b82f6',
    event_type: 'event',
  });

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch('/api/events');
      if (!response.ok) throw new Error('Failed to fetch');
      
      const data = await response.json();
      const mapped = (data.events || []).map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        color: e.color,
        event_type: e.event_type,
        task_id: e.task_id,
        status: e.status,
      }));
      
      setEvents(mapped);
    } catch (error) {
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedDate(start);
    setSelectedEvent(null);
    setFormData({
      title: '',
      description: '',
      start: format(start, "yyyy-MM-dd'T'HH:mm"),
      end: format(end, "yyyy-MM-dd'T'HH:mm"),
      color: '#3b82f6',
      event_type: 'event',
    });
    setShowModal(true);
  };

  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedDate(event.start);
    setSelectedEvent(event);
    setFormData({
      title: event.title,
      description: event.description || '',
      start: format(event.start, "yyyy-MM-dd'T'HH:mm"),
      end: format(event.end, "yyyy-MM-dd'T'HH:mm"),
      color: event.color || '#3b82f6',
      event_type: event.event_type || 'event',
    });
    setShowModal(true);
  };

  const handleToggleTaskStatus = async (event: CalendarEvent) => {
    if (!event.task_id) return;
    const isCompleted = event.title.startsWith('✅');
    const newStatus = isCompleted ? 'todo' : 'completed';

    // Optimistic UI update
    setEvents(prev => prev.map(e => {
      if (e.id === event.id) {
        return {
          ...e,
          title: isCompleted ? e.title.replace('✅', '📋') : e.title.replace('📋', '✅'),
          color: isCompleted ? '#f59e0b' : '#10b981',
        };
      }
      return e;
    }));

    try {
      const res = await fetch(`/api/tasks/${event.task_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error();
      toast.success(newStatus === 'completed' ? 'Task completed! 🎉' : 'Task reopened');
      fetchEvents();
    } catch (e) {
      toast.error('Failed to update task');
      fetchEvents();
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        start_time: new Date(formData.start).toISOString(),
        end_time: new Date(formData.end).toISOString(),
        color: formData.color,
        event_type: formData.event_type,
      };

      if (selectedEvent) {
        const res = await fetch(`/api/events/${selectedEvent.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to update');
        toast.success('Event updated');
      } else {
        const res = await fetch('/api/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error('Failed to create');
        toast.success('Event created');
      }

      await fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      toast.error('Failed to save event');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedEvent) return;
    if (!confirm('Delete this event?')) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/events/${selectedEvent.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete');
      
      toast.success('Event deleted');
      await fetchEvents();
      setShowModal(false);
      setSelectedEvent(null);
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setSaving(false);
    }
  };

  // Events for the currently selected day
  const selectedDayEvents = events
    .filter(e => isSameDay(e.start, selectedDate))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const eventStyleGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: event.color || 'var(--theme-accent)',
      color: '#ffffff',
      border: 'none',
      borderRadius: '6px',
      padding: '3px 6px',
      fontSize: '12px',
      fontWeight: '600',
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }} />
          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-8 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Calendar</h1>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Manage your schedule, tasks, and events</p>
          </div>
          <Button
            onClick={() => {
              const now = new Date();
              const later = new Date(now.getTime() + 60 * 60 * 1000);
              setFormData({
                title: '',
                description: '',
                start: format(now, "yyyy-MM-dd'T'HH:mm"),
                end: format(later, "yyyy-MM-dd'T'HH:mm"),
                color: '#3b82f6',
                event_type: 'event',
              });
              setSelectedEvent(null);
              setShowModal(true);
            }}
            className="font-bold text-white shadow-lg rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-3 glass-card border shadow-xl rounded-2xl" style={{ borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-6">
              <div style={{ height: '700px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={(newDate) => { setDate(newDate); setSelectedDate(newDate); }}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  style={{ height: '100%' }}
                />
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6 text-xs border-t pt-4" style={{ borderColor: 'var(--theme-border)' }}>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
                  <span style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}>Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
                  <span style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}>Pending Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
                  <span style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}>Completed Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                  <span style={{ color: 'var(--theme-text-primary)', opacity: 0.8 }}>Urgent / Pomodoro</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Day Sidebar */}
          <Card className="glass-card border shadow-xl rounded-2xl max-h-[780px] flex flex-col" style={{ borderColor: 'var(--theme-border)' }}>
            <CardContent className="p-6 flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
                  <Clock className="w-5 h-5" style={{ color: 'var(--theme-accent)' }} />
                  {isToday(selectedDate) ? 'Today' : format(selectedDate, 'MMM d, yyyy')}
                </h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full" style={{ background: 'var(--theme-background-alt)', color: 'var(--theme-text-primary)' }}>
                  {selectedDayEvents.length} items
                </span>
              </div>

              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-sm opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                    No events scheduled for this day
                  </p>
                  <p className="text-xs opacity-40" style={{ color: 'var(--theme-text-primary)' }}>
                    Click any slot on the calendar to schedule a task or event
                  </p>
                </div>
              ) : (
                <div className="space-y-3 overflow-y-auto max-h-[650px] pr-2 custom-scrollbar flex-1">
                  {selectedDayEvents.map(event => {
                    const isTask = event.event_type === 'task' || !!event.task_id;
                    const isCompleted = event.title.startsWith('✅') || event.color === '#10b981';

                    return (
                      <div
                        key={event.id}
                        className="p-3 border rounded-xl hover:scale-[1.01] transition-all glass-card relative group"
                        style={{ borderColor: 'var(--theme-border)' }}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className="w-1.5 h-full min-h-[36px] rounded-full flex-shrink-0 mt-0.5"
                            style={{ backgroundColor: event.color || 'var(--theme-accent)' }}
                          />
                          <div 
                            className="flex-1 min-w-0 cursor-pointer"
                            onClick={() => handleSelectEvent(event)}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <p 
                                className={`text-sm font-bold truncate ${isCompleted ? 'line-through opacity-70' : ''}`} 
                                style={{ color: 'var(--theme-text-primary)' }}
                              >
                                {event.title}
                              </p>
                              <span 
                                className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md flex-shrink-0"
                                style={{ 
                                  background: isCompleted ? 'rgba(16, 185, 129, 0.2)' : 'rgba(245, 158, 11, 0.2)',
                                  color: isCompleted ? '#10b981' : '#f59e0b' 
                                }}
                              >
                                {isCompleted ? 'Done' : 'Pending'}
                              </span>
                            </div>
                            <p className="text-xs opacity-70 mt-1" style={{ color: 'var(--theme-text-primary)' }}>
                              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                            </p>
                            {event.description && (
                              <p className="text-xs opacity-50 mt-1 line-clamp-1" style={{ color: 'var(--theme-text-primary)' }}>
                                {event.description}
                              </p>
                            )}
                          </div>

                          {/* Quick Toggle Checkbox for Tasks */}
                          {isTask && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleTaskStatus(event);
                              }}
                              className="p-1 hover:scale-110 transition-transform flex-shrink-0 mt-0.5"
                              title={isCompleted ? 'Mark as Pending' : 'Mark as Completed'}
                            >
                              {isCompleted ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                              ) : (
                                <Circle className="w-5 h-5 opacity-40 hover:opacity-100" style={{ color: 'var(--theme-text-primary)' }} />
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg glass-card border rounded-2xl shadow-2xl" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                    {selectedEvent ? 'Edit Event' : 'New Event'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="p-1 rounded-full hover:bg-white/10 transition" style={{ color: 'var(--theme-text-primary)' }}>
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Title *</label>
                    <Input
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Event title"
                      className="rounded-xl"
                      style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add description..."
                      rows={3}
                      className="rounded-xl"
                      style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Start</label>
                      <Input
                        type="datetime-local"
                        value={formData.start}
                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                        className="rounded-xl"
                        style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>End</label>
                      <Input
                        type="datetime-local"
                        value={formData.end}
                        onChange={e => setFormData({ ...formData, end: e.target.value })}
                        className="rounded-xl"
                        style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Type</label>
                      <select
                        value={formData.event_type}
                        onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                        className="w-full p-2.5 rounded-xl border bg-transparent text-sm font-medium"
                        style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                      >
                        <option value="event" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Event</option>
                        <option value="task" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Task</option>
                        <option value="class" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Class</option>
                        <option value="pomodoro" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Pomodoro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Color</label>
                      <div className="flex gap-2">
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                          <button
                            key={c}
                            type="button"
                            onClick={() => setFormData({ ...formData, color: c })}
                            className={`w-8 h-8 rounded-full border-2 transition-transform ${formData.color === c ? 'scale-110 border-white shadow' : 'border-transparent'}`}
                            style={{ backgroundColor: c }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    {selectedEvent && (
                      <Button
                        onClick={handleDelete}
                        disabled={saving}
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-500/10 rounded-xl"
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 font-bold text-white rounded-xl"
                      style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                    >
                      {saving ? 'Saving...' : selectedEvent ? 'Update' : 'Create'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
