'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Play, Pause, RotateCcw, Settings, X } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

type Mode = 'work' | 'break';

export default function PomodoroClient() {
  // Settings
  const [totalMinutes, setTotalMinutes] = useState(120); // Total study time in minutes
  const [workDuration, setWorkDuration] = useState(25);
  const [breakDuration, setBreakDuration] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  
  // Timer state
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<Mode>('work');
  
  // Session tracking
  const [completedSessions, setCompletedSessions] = useState(0);
  const [totalSessions, setTotalSessions] = useState(0);
  const [sessionStartTime, setSessionStartTime] = useState<Date | null>(null);
  const [todaySessions, setTodaySessions] = useState<any[]>([]);

  // Calculate total sessions needed
  useEffect(() => {
    const sessions = Math.ceil(totalMinutes / workDuration);
    setTotalSessions(sessions);
  }, [totalMinutes, workDuration]);

  // Fetch today's sessions
  const fetchSessions = useCallback(async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const response = await fetch(`/api/pomodoro?date=${today}`);
      if (!response.ok) return;
      
      const data = await response.json();
      setTodaySessions(data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  // Timer countdown
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            handleTimerComplete();
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  // Save to localStorage for persistence
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('pomodoro', JSON.stringify({
        minutes,
        seconds,
        mode,
        completedSessions,
        isActive: false, // Don't persist running state
      }));
    }
  }, [minutes, seconds, mode, completedSessions]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('pomodoro');
      if (saved) {
        try {
          const data = JSON.parse(saved);
          setMinutes(data.minutes || workDuration);
          setSeconds(data.seconds || 0);
          setMode(data.mode || 'work');
          setCompletedSessions(data.completedSessions || 0);
        } catch (e) {
          console.error('Failed to load saved timer');
        }
      }
    }
  }, []);

  const handleTimerComplete = async () => {
    setIsActive(false);

    // Play notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Pomodoro Timer', {
          body: mode === 'work' ? 'Work session complete! Time for a break.' : 'Break is over! Ready to focus?',
        });
      }
    }

    // Save completed work session
    if (mode === 'work' && sessionStartTime) {
      const endTime = new Date();
      try {
        await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `Focus Session ${completedSessions + 1}`,
            start_time: sessionStartTime.toISOString(),
            end_time: endTime.toISOString(),
          }),
        });

        setCompletedSessions(prev => prev + 1);
        fetchSessions();
        toast.success('Session completed!');
      } catch (error) {
        console.error('Error saving session:', error);
      }

      // Check if all sessions complete
      if (completedSessions + 1 >= totalSessions) {
        toast.success('🎉 All study sessions completed!');
        setSessionStartTime(null);
        return;
      }

      // Switch to break
      setMode('break');
      setMinutes(breakDuration);
      setSeconds(0);
    } else {
      // Break finished, back to work
      setMode('work');
      setMinutes(workDuration);
      setSeconds(0);
      toast.success('Break finished!');
    }
  };

  const toggleTimer = () => {
    if (!isActive && mode === 'work' && !sessionStartTime) {
      setSessionStartTime(new Date());
    }
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMinutes(mode === 'work' ? workDuration : breakDuration);
    setSeconds(0);
    setSessionStartTime(null);
  };

  const resetAll = () => {
    setIsActive(false);
    setMode('work');
    setMinutes(workDuration);
    setSeconds(0);
    setCompletedSessions(0);
    setSessionStartTime(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('pomodoro');
    }
  };

  const progress = mode === 'work' 
    ? ((workDuration * 60 - (minutes * 60 + seconds)) / (workDuration * 60)) * 100
    : ((breakDuration * 60 - (minutes * 60 + seconds)) / (breakDuration * 60)) * 100;

  const totalMinutesStudied = todaySessions.reduce((acc, session) => {
    const start = new Date(session.start_time);
    const end = new Date(session.end_time);
    return acc + (end.getTime() - start.getTime()) / (1000 * 60);
  }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-1">Pomodoro Timer</h1>
            <p className="text-sm text-gray-600">
              {completedSessions} of {totalSessions} sessions completed
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="border-gray-300"
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Timer */}
          <div className="lg:col-span-2">
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-12">
                {/* Mode Tabs */}
                <div className="flex justify-center gap-4 mb-8">
                  <Button
                    variant={mode === 'work' ? 'default' : 'outline'}
                    onClick={() => {
                      if (!isActive) {
                        setMode('work');
                        setMinutes(workDuration);
                        setSeconds(0);
                      }
                    }}
                    className={mode === 'work' ? 'bg-blue-600 hover:bg-blue-700' : ''}
                    disabled={isActive}
                  >
                    Focus
                  </Button>
                  <Button
                    variant={mode === 'break' ? 'default' : 'outline'}
                    onClick={() => {
                      if (!isActive) {
                        setMode('break');
                        setMinutes(breakDuration);
                        setSeconds(0);
                      }
                    }}
                    className={mode === 'break' ? 'bg-green-600 hover:bg-green-700' : ''}
                    disabled={isActive}
                  >
                    Break
                  </Button>
                </div>

                {/* Timer Circle */}
                <div className="relative mb-8">
                  <svg className="w-full max-w-md mx-auto" viewBox="0 0 200 200">
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="12"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke={mode === 'work' ? '#3b82f6' : '#10b981'}
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-7xl font-bold text-gray-900 tabular-nums">
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className={`text-sm font-medium mt-2 ${
                        mode === 'work' ? 'text-blue-600' : 'text-green-600'
                      }`}>
                        {mode === 'work' ? 'Focus Time' : 'Break Time'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={toggleTimer}
                    size="lg"
                    className={`w-32 ${
                      isActive
                        ? 'bg-orange-600 hover:bg-orange-700'
                        : mode === 'work' 
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-green-600 hover:bg-green-700'
                    } text-white`}
                  >
                    {isActive ? (
                      <>
                        <Pause className="w-5 h-5 mr-2" />
                        Pause
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Start
                      </>
                    )}
                  </Button>
                  <Button
                    onClick={resetTimer}
                    size="lg"
                    variant="outline"
                    className="border-gray-300"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Session Progress */}
                <div className="mt-8 pt-8 border-t border-gray-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-700">Session Progress</span>
                    <span className="text-sm text-gray-600">{completedSessions}/{totalSessions}</span>
                  </div>
                  <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 transition-all"
                      style={{ width: `${(completedSessions / totalSessions) * 100}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Stats</h3>
                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-blue-50 border border-blue-100">
                    <div className="text-3xl font-bold text-blue-600">{todaySessions.length}</div>
                    <div className="text-sm text-gray-600">Sessions</div>
                  </div>
                  <div className="p-4 rounded-lg bg-green-50 border border-green-100">
                    <div className="text-3xl font-bold text-green-600">{Math.round(totalMinutesStudied)}</div>
                    <div className="text-sm text-gray-600">Minutes</div>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 border border-purple-100">
                    <div className="text-3xl font-bold text-purple-600">
                      {Math.round(totalMinutesStudied / 60 * 10) / 10}
                    </div>
                    <div className="text-sm text-gray-600">Hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border border-gray-200 shadow-sm">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={resetAll}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Reset All Sessions
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md bg-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">Timer Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Total Study Time (minutes)
                    </label>
                    <Input
                      type="number"
                      value={totalMinutes}
                      onChange={(e) => setTotalMinutes(parseInt(e.target.value) || 120)}
                      min="25"
                      step="25"
                      className="border-gray-300"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      This will be divided into {Math.ceil(totalMinutes / workDuration)} sessions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Work Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={workDuration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 25;
                        setWorkDuration(val);
                        if (mode === 'work' && !isActive) setMinutes(val);
                      }}
                      min="1"
                      max="60"
                      className="border-gray-300"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Break Duration (minutes)
                    </label>
                    <Input
                      type="number"
                      value={breakDuration}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 5;
                        setBreakDuration(val);
                        if (mode === 'break' && !isActive) setMinutes(val);
                      }}
                      min="1"
                      max="30"
                      className="border-gray-300"
                    />
                  </div>

                  <Button
                    onClick={() => setShowSettings(false)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Save Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
