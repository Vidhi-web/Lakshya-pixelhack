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
    fetchTimetable();
  }, []);

  const fetchTimetable = async () => {
    try {
      const response = await fetch('/api/timetable');
      if (response.ok) {
        const data = await response.json();
        setSlots(data.slots || []);
      }
    } catch (error) {
      console.error('Error fetching timetable:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.subject.trim()) {
      toast.error('Please enter a subject name');
      return;
    }

    try {
      if (editingSlot) {
        const response = await fetch(`/api/timetable/${editingSlot.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to update');
        toast.success('Slot updated!');
      } else {
        const response = await fetch('/api/timetable', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) throw new Error('Failed to create');
        toast.success('Slot added!');
      }

      await fetchTimetable();
      setShowModal(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save slot');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slot?')) return;

    try {
      const response = await fetch(`/api/timetable/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete');

      toast.success('Slot deleted');
      await fetchTimetable();
    } catch (error) {
      toast.error('Failed to delete slot');
    }
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

  const resetForm = () => {
    setEditingSlot(null);
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
  };

  const getSlotsForDay = (day: string) => {
    return slots
      .filter(slot => slot.day === day)
      .sort((a, b) => a.start_time.localeCompare(b.start_time));
  };

  const getCurrentDay = () => {
    const dayIndex = new Date().getDay();
    return dayIndex === 0 ? 'Sunday' : DAYS[dayIndex - 1];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-gray-600">Loading timetable...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <Toaster position="top-right" />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Class Timetable</h1>
            <p className="text-gray-600 dark:text-gray-400">Today is {getCurrentDay()}</p>
          </div>
          <Button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Slot
          </Button>
        </div>

        {/* Timetable Grid */}
        <Card className="border border-gray-200 dark:border-gray-800 shadow-lg">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="p-4 text-left text-sm font-semibold text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-800/50 w-32">
                      Time
                    </th>
                    {DAYS.map(day => (
                      <th
                        key={day}
                        className={`p-4 text-center text-sm font-semibold bg-gray-50 dark:bg-gray-800/50 ${
                          day === getCurrentDay()
                            ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20'
                            : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        {day}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {TIME_SLOTS.map(time => (
                    <tr key={time} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400 font-medium bg-gray-50 dark:bg-gray-800/20">
                        {time}
                      </td>
                      {DAYS.map(day => {
                        const daySlots = getSlotsForDay(day);
                        const slot = daySlots.find(s => s.start_time === time);

                        return (
                          <td key={`${day}-${time}`} className="p-2">
                            {slot ? (
                              <div
                                className="p-3 rounded-lg text-white shadow-sm hover:shadow-md transition cursor-pointer group relative"
                                style={{ backgroundColor: slot.color }}
                                onClick={() => openEditModal(slot)}
                              >
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-sm truncate">{slot.subject}</p>
                                    <p className="text-xs opacity-90 mt-1">
                                      {slot.start_time} - {slot.end_time}
                                    </p>
                                    {slot.room && (
                                      <p className="text-xs opacity-75 mt-1">{slot.room}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleDelete(slot.id);
                                    }}
                                    className="opacity-0 group-hover:opacity-100 transition p-1 hover:bg-white/20 rounded"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="h-20" />
                            )}
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

        {/* Today's Classes Summary */}
        <Card className="mt-6 border border-gray-200 dark:border-gray-800">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Today's Schedule
            </h3>
            {getSlotsForDay(getCurrentDay()).length > 0 ? (
              <div className="space-y-3">
                {getSlotsForDay(getCurrentDay()).map(slot => (
                  <div
                    key={slot.id}
                    className="flex items-center gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700"
                  >
                    <div
                      className="w-1 h-16 rounded"
                      style={{ backgroundColor: slot.color }}
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 dark:text-white">{slot.subject}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        {slot.start_time} - {slot.end_time}
                      </p>
                      {slot.professor && (
                        <p className="text-sm text-gray-500 dark:text-gray-500 mt-1">{slot.professor}</p>
                      )}
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300">
                      {slot.type}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-8">No classes today!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingSlot ? 'Edit Slot' : 'Add New Slot'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Subject *
              </label>
              <Input
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="e.g., Data Structures"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Day</label>
                <select
                  value={formData.day}
                  onChange={(e) => setFormData({ ...formData, day: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                >
                  {DAYS.map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm dark:bg-gray-800 dark:border-gray-700"
                >
                  <option value="lecture">Lecture</option>
                  <option value="lab">Lab</option>
                  <option value="tutorial">Tutorial</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Time
                </label>
                <Input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Time
                </label>
                <Input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Room (Optional)
              </label>
              <Input
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                placeholder="e.g., Room 301"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Professor (Optional)
              </label>
              <Input
                value={formData.professor}
                onChange={(e) => setFormData({ ...formData, professor: e.target.value })}
                placeholder="e.g., Dr. Smith"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Color
              </label>
              <div className="flex gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => setFormData({ ...formData, color })}
                    className={`w-10 h-10 rounded-lg border-2 transition ${
                      formData.color === color ? 'border-gray-900 dark:border-white scale-110' : 'border-gray-200'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editingSlot ? 'Update' : 'Add'} Slot
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
