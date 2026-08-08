'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Calendar, Plus, Edit2, Trash2, Clock, BookOpen, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

interface TimetableSlot {
  id: string;
  day: string;
  start_time: string;
  end_time: string;
  subject: string;
  type: 'lecture' | 'lab' | 'tutorial' | 'other';
  room?: string;
  professor?: string;
  color: string;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const TIME_SLOTS = Array.from({ length: 14 }, (_, i) => {
  const hour = 8 + i;
  return `${hour.toString().padStart(2, '0')}:00`;
});

const COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', 
  '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'
];

export default function TimetablePage() {
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<TimetableSlot | null>(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    day: 'Monday',
    start_time: '09:00',
    end_time: '10:00',
    subject: '',
    type: 'lecture' as 'lecture' | 'lab' | 'tutorial' | 'other',
    room: '',
    professor: '',
    color: COLORS[0],
  });

  useEffect(() => {
    fetchSlots();
  }, []);

  const fetchSlots = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/timetable');
      let apiSlots: TimetableSlot[] = [];
      if (response.ok) {
        const data = await response.json();
        apiSlots = data.slots || [];
      }

      // Load local storage backup slots
      const localData = localStorage.getItem('lakshya-timetable-slots');
      const localSlots: TimetableSlot[] = localData ? JSON.parse(localData) : [];

      // Combine API slots and Local slots without duplicates
      const slotMap = new Map<string, TimetableSlot>();
      localSlots.forEach(s => slotMap.set(s.id, s));
      apiSlots.forEach(s => slotMap.set(s.id, s));

      const mergedSlots = Array.from(slotMap.values());
      setSlots(mergedSlots);
    } catch (error) {
      console.warn('Failed to load slots from API, using fallback:', error);
      const localData = localStorage.getItem('lakshya-timetable-slots');
      if (localData) {
        setSlots(JSON.parse(localData));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    const slotId = editingSlot ? editingSlot.id : 'slot-' + Date.now();
    const newSlot: TimetableSlot = { id: slotId, ...formData };

    // Optimistic UI update
    setSlots(prev => {
      const updated = editingSlot 
        ? prev.map(s => s.id === slotId ? newSlot : s)
        : [...prev.filter(s => s.id !== slotId), newSlot];
      localStorage.setItem('lakshya-timetable-slots', JSON.stringify(updated));
      return updated;
    });

    toast.success(editingSlot ? 'Slot updated!' : 'Slot added!');
    setShowModal(false);
    resetForm();

    // Async sync to Supabase backend
    try {
      const url = editingSlot ? `/api/timetable/${editingSlot.id}` : '/api/timetable';
      const method = editingSlot ? 'PATCH' : 'POST';
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
    } catch (error) {
      console.warn('Backend sync warning:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slot?')) return;

    setSlots(prev => {
      const updated = prev.filter(s => s.id !== id);
      localStorage.setItem('lakshya-timetable-slots', JSON.stringify(updated));
      return updated;
    });
    toast.success('Slot deleted!');

    try {
      await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
    } catch (error) {
      console.warn('Backend delete warning:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      day: 'Monday',
      start_time: '09:00',
      end_time: '10:00',
      subject: '',
      type: 'lecture',
      room: '',
      professor: '',
      color: COLORS[0],
    });
    setEditingSlot(null);
  };

  const openEditModal = (slot: TimetableSlot) => {
    setEditingSlot(slot);
    setFormData({
      day: slot.day,
      start_time: slot.start_time,
      end_time: slot.end_time,
      subject: slot.subject,
      type: slot.type,
      room: slot.room || '',
      professor: slot.professor || '',
      color: slot.color,
    });
    setShowModal(true);
  };

  const getCurrentDay = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    return days[new Date().getDay()];
  };

  const getSlotsForDay = (day: string) => {
    return slots.filter(s => s.day === day);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--theme-accent)', borderTopColor: 'transparent' }} />
          <p className="opacity-70" style={{ color: 'var(--theme-text-primary)' }}>Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen transition-colors p-4 md:p-8" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <Calendar className="w-8 h-8" style={{ color: 'var(--theme-accent)' }} />
              <h1 className="text-3xl font-extrabold" style={{ color: 'var(--theme-text-primary)' }}>Weekly Timetable</h1>
            </div>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
              Organize your classes, lectures, and study commitments
            </p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="font-bold text-white shadow-lg rounded-xl"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>

        {/* Timetable Grid */}
        <Card className="glass-card border shadow-xl rounded-2xl overflow-hidden" style={{ borderColor: 'var(--theme-border)' }}>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--theme-border)' }}>
                    <th 
                      className="p-4 text-left text-sm font-semibold w-32"
                      style={{ background: 'var(--theme-background-alt)', color: 'var(--theme-text-primary)' }}
                    >
                      Time
                    </th>
                    {DAYS.map(day => (
                      <th
                        key={day}
                        className="p-4 text-center text-sm font-semibold transition-colors"
                        style={{
                          background: day === getCurrentDay() ? 'var(--theme-surface)' : 'var(--theme-background-alt)',
                          color: day === getCurrentDay() ? 'var(--theme-accent)' : 'var(--theme-text-primary)',
                        }}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(time => (
                    <tr 
                      key={time} 
                      className="border-b transition-colors hover:bg-white/5"
                      style={{ borderColor: 'var(--theme-border)' }}
                    >
                      <td 
                        className="p-4 text-sm font-medium"
                        style={{ background: 'var(--theme-background-alt)', color: 'var(--theme-text-secondary)' }}
                      >
                        {time}
                      </td>
                      {DAYS.map(day => {
                        const daySlots = getSlotsForDay(day);
                        const slot = daySlots.find(s => s.start_time === time);

                        return (
                          <td key={`${day}-${time}`} className="p-2">
                            {slot ? (
                              <div
                                className="p-3 rounded-xl text-white shadow-md hover:scale-[1.02] transition-transform cursor-pointer group relative"
                                style={{ backgroundColor: slot.color }}
                                onClick={() => openEditModal(slot)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-bold text-sm truncate">{slot.subject}</p>
                                    <p className="text-xs opacity-90 mt-1">
                                      {slot.start_time} - {slot.end_time}
                                    </p>
                                    {slot.room && (
                                      <p className="text-xs opacity-75 mt-0.5">Room: {slot.room}</p>
                                    )}
                                    {slot.professor && (
                                      <p className="text-xs opacity-75 truncate">{slot.professor}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(slot.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-black/20 rounded transition"
                                  >
                                    <Trash2 className="w-4 h-4 text-white" />
                                  </button>
                                </div>
                              </div>
                            ) : null}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <Dialog open={showModal} onOpenChange={setShowModal}>
          <DialogContent className="glass-card border rounded-2xl p-6" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
            <DialogHeader>
              <DialogTitle className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>
                {editingSlot ? 'Edit Slot' : 'Add Slot'}
              </DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4 pt-4">
              <div>
                <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Subject</label>
                <Input
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  placeholder="e.g. Data Structures"
                  required
                  className="rounded-xl"
                  style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Day</label>
                  <select
                    value={formData.day}
                    onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm font-medium"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  >
                    {DAYS.map(day => (
                      <option key={day} value={day} style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>{day}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Type</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm font-medium"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  >
                    <option value="lecture" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Lecture</option>
                    <option value="lab" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Lab</option>
                    <option value="tutorial" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Tutorial</option>
                    <option value="other" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>Other</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Start Time</label>
                  <select
                    value={formData.start_time}
                    onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm font-medium"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time} style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>{time}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>End Time</label>
                  <select
                    value={formData.end_time}
                    onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                    className="w-full p-2.5 rounded-xl border bg-transparent text-sm font-medium"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  >
                    {TIME_SLOTS.map(time => (
                      <option key={time} value={time} style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>{time}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Room (Optional)</label>
                  <Input
                    value={formData.room}
                    onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                    placeholder="e.g. Lab 3"
                    className="rounded-xl"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Professor (Optional)</label>
                  <Input
                    value={formData.professor}
                    onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                    placeholder="e.g. Dr. Smith"
                    className="rounded-xl"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold mb-2" style={{ color: 'var(--theme-text-primary)' }}>Card Color</label>
                <div className="flex gap-2">
                  {COLORS.map(color => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFormData({ ...formData, color })}
                      className={`w-8 h-8 rounded-full border-2 transition-transform ${
                        formData.color === color ? 'scale-110 border-white shadow' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <DialogFooter className="pt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)} className="rounded-xl">
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="font-bold text-white rounded-xl"
                  style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                >
                  {editingSlot ? 'Save Changes' : 'Add Slot'}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
