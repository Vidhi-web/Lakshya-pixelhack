'use client';

import { useState, useEffect, useCallback } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, isToday, parseISO } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { X, Clock, Plus } from 'lucide-react';
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
}

export default function CalendarPageClient() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());
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
      const mapped = data.events.map((e: any) => ({
        id: e.id,
        title: e.title,
        description: e.description,
        start: new Date(e.start_time),
        end: new Date(e.end_time),
        color: e.color,
        event_type: e.event_type,
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

  const todayEvents = events
    .filter(e => isToday(e.start))
    .sort((a, b) => a.start.getTime() - b.start.getTime());

  const eventStyleGetter = (event: CalendarEvent) => ({
    style: {
      backgroundColor: event.color || '#3b82f6',
      color: '#ffffff',
      border: 'none',
      borderRadius: '4px',
      padding: '2px 4px',
      fontSize: '13px',
    },
  });

  if (loading) {
    return (
      <div className="page-background min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading calendar...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-background min-h-screen">
      <Toaster position="top-right" />
      
      <div className="page-container">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Calendar</h1>
            <p className="text-sm text-gray-600">Manage your schedule and events</p>
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
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Main Calendar */}
          <Card className="lg:col-span-3 border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div style={{ height: '700px' }}>
                <Calendar
                  localizer={localizer}
                  events={events}
                  view={view}
                  onView={setView}
                  date={date}
                  onNavigate={setDate}
                  onSelectSlot={handleSelectSlot}
                  onSelectEvent={handleSelectEvent}
                  selectable
                  eventPropGetter={eventStyleGetter}
                  style={{ height: '100%' }}
                />
              </div>

              {/* Legend */}
              <div className="mt-4 flex items-center gap-6 text-xs border-t border-gray-200 pt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#3b82f6' }} />
                  <span className="text-gray-600">Event</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#f59e0b' }} />
                  <span className="text-gray-600">Task</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#10b981' }} />
                  <span className="text-gray-600">Class</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: '#ef4444' }} />
                  <span className="text-gray-600">Pomodoro</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Today Sidebar */}
          <Card className="border border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-blue-600" />
                Today
              </h3>
              {todayEvents.length === 0 ? (
                <p className="text-sm text-gray-500 text-center py-8">No events today</p>
              ) : (
                <div className="space-y-3">
                  {todayEvents.map(event => (
                    <div
                      key={event.id}
                      onClick={() => handleSelectEvent(event)}
                      className="p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer transition"
                    >
                      <div className="flex items-start gap-2">
                        <div
                          className="w-1 h-full rounded"
                          style={{ backgroundColor: event.color }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-lg bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900">
                    {selectedEvent ? 'Edit Event' : 'New Event'}
                  </h2>
                  <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                    <Input
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Event title"
                      className="border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <Textarea
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Add description..."
                      rows={3}
                      className="border-gray-300"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                      <Input
                        type="datetime-local"
                        value={formData.start}
                        onChange={e => setFormData({ ...formData, start: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                      <Input
                        type="datetime-local"
                        value={formData.end}
                        onChange={e => setFormData({ ...formData, end: e.target.value })}
                        className="border-gray-300"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                      <select
                        value={formData.event_type}
                        onChange={e => setFormData({ ...formData, event_type: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      >
                        <option value="event">Event</option>
                        <option value="task">Task</option>
                        <option value="class">Class</option>
                        <option value="pomodoro">Pomodoro</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div className="flex gap-2">
                        {['#3b82f6', '#10b981', '#f59e0b', '#ef4444'].map(c => (
                          <button
                            key={c}
                            onClick={() => setFormData({ ...formData, color: c })}
                            className={`w-8 h-8 rounded border-2 ${formData.color === c ? 'border-gray-900' : 'border-gray-200'}`}
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
                        className="text-red-600 border-red-600 hover:bg-red-50"
                      >
                        Delete
                      </Button>
                    )}
                    <Button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
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
