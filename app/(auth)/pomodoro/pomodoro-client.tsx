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
        if (seconds > 0) {
          setSeconds(seconds - 1);
        } else if (minutes > 0) {
          setMinutes(minutes - 1);
          setSeconds(59);
        } else {
          // Timer finished
          handleTimerComplete();
        }
      }, 1000);
    } else {
      if (interval) clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds]);

  const handleTimerComplete = async () => {
    // Play sound notification
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(mode === 'work' ? 'Work session complete!' : 'Break time over!', {
          body: mode === 'work' ? 'Time for a break!' : 'Back to work!',
        });
      }
    }

    if (mode === 'work') {
      const newCompleted = completedSessions + 1;
      setCompletedSessions(newCompleted);
      
      // Save completed work session to DB
      try {
        const endTime = new Date();
        const startTime = sessionStartTime || new Date(endTime.getTime() - workDuration * 60 * 1000);
        
        await fetch('/api/pomodoro', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            duration_minutes: workDuration,
            completed: true,
            start_time: startTime.toISOString(),
            end_time: endTime.toISOString(),
          }),
        });

        fetchSessions();
        toast.success(`🎉 Session ${newCompleted}/${totalSessions} completed!`);
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
    toast.success('Sessions reset');
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
    <div className="min-h-screen p-4 md:p-8 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <Toaster position="top-right" />
      
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold mb-1" style={{ color: 'var(--theme-text-primary)' }}>Pomodoro Timer</h1>
            <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
              {completedSessions} of {totalSessions} sessions completed
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowSettings(true)}
            className="rounded-xl border"
            style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
          >
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Timer Card */}
          <div className="lg:col-span-2">
            <Card className="glass-card border shadow-xl rounded-2xl" style={{ borderColor: 'var(--theme-border)' }}>
              <CardContent className="p-8 md:p-12">
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
                    className="rounded-xl font-bold px-6"
                    style={{ 
                      background: mode === 'work' ? 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' : 'transparent',
                      color: mode === 'work' ? '#FFFFFF' : 'var(--theme-text-primary)',
                      borderColor: 'var(--theme-border)' 
                    }}
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
                    className="rounded-xl font-bold px-6"
                    style={{ 
                      background: mode === 'break' ? 'var(--theme-surface)' : 'transparent',
                      color: 'var(--theme-text-primary)',
                      borderColor: 'var(--theme-border)' 
                    }}
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
                      stroke="var(--theme-border)"
                      strokeWidth="10"
                      opacity="0.3"
                    />
                    <circle
                      cx="100"
                      cy="100"
                      r="90"
                      fill="none"
                      stroke="var(--theme-accent)"
                      strokeWidth="10"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 90}`}
                      strokeDashoffset={`${2 * Math.PI * 90 * (1 - progress / 100)}`}
                      transform="rotate(-90 100 100)"
                      style={{ transition: 'stroke-dashoffset 1s linear' }}
                    />
                  </svg>
                  
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-6xl md:text-7xl font-extrabold tabular-nums tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
                        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
                      </div>
                      <div className="text-sm font-semibold mt-2 tracking-wide uppercase opacity-80" style={{ color: 'var(--theme-accent)' }}>
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
                    className="w-36 rounded-xl font-bold text-white shadow-lg"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
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
                    className="rounded-xl border"
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Reset
                  </Button>
                </div>

                {/* Session Progress */}
                <div className="mt-8 pt-8 border-t" style={{ borderColor: 'var(--theme-border)' }}>
                  <div className="flex justify-between items-center mb-2 font-medium text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                    <span>Session Progress</span>
                    <span className="opacity-70">{completedSessions}/{totalSessions}</span>
                  </div>
                  <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
                    <div
                      className="h-full transition-all duration-500"
                      style={{ width: `${(completedSessions / Math.max(1, totalSessions)) * 100}%`, background: 'var(--theme-accent)' }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Sidebar */}
          <div className="space-y-6">
            {/* Today's Stats */}
            <Card className="glass-card border shadow-xl rounded-2xl" style={{ borderColor: 'var(--theme-border)' }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
                  Today's Stats
                </h3>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl border glass-card flex items-center justify-between" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
                    <div>
                      <div className="text-xs opacity-60 font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Sessions</div>
                      <div className="text-sm opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Completed today</div>
                    </div>
                    <div className="text-3xl font-extrabold" style={{ color: 'var(--theme-accent)' }}>{todaySessions.length}</div>
                  </div>

                  <div className="p-4 rounded-xl border glass-card flex items-center justify-between" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
                    <div>
                      <div className="text-xs opacity-60 font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Minutes</div>
                      <div className="text-sm opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Total focused</div>
                    </div>
                    <div className="text-3xl font-extrabold" style={{ color: 'var(--theme-accent)' }}>{Math.round(totalMinutesStudied)}</div>
                  </div>

                  <div className="p-4 rounded-xl border glass-card flex items-center justify-between" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
                    <div>
                      <div className="text-xs opacity-60 font-semibold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>Hours</div>
                      <div className="text-sm opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Total hours</div>
                    </div>
                    <div className="text-3xl font-extrabold" style={{ color: 'var(--theme-accent)' }}>
                      {Math.round((totalMinutesStudied / 60) * 10) / 10}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="glass-card border shadow-xl rounded-2xl" style={{ borderColor: 'var(--theme-border)' }}>
              <CardContent className="p-6">
                <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--theme-text-primary)' }}>
                  Quick Actions
                </h3>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full justify-start rounded-xl border hover:bg-white/10"
                    onClick={resetAll}
                    style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
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
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md glass-card border rounded-2xl shadow-2xl" style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold" style={{ color: 'var(--theme-text-primary)' }}>Timer Settings</h2>
                  <button
                    onClick={() => setShowSettings(false)}
                    className="p-1 rounded-full hover:bg-white/10 transition"
                    style={{ color: 'var(--theme-text-primary)' }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                      Total Study Time (minutes)
                    </label>
                    <Input
                      type="number"
                      value={totalMinutes}
                      onChange={(e) => setTotalMinutes(parseInt(e.target.value) || 120)}
                      min="25"
                      step="25"
                      className="rounded-xl"
                      style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                    />
                    <p className="text-xs opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>
                      This will be divided into {Math.ceil(totalMinutes / workDuration)} sessions
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
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
                      className="rounded-xl"
                      style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-1" style={{ color: 'var(--theme-text-primary)' }}>
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
                      className="rounded-xl"
                      style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                    />
                  </div>

                  <Button
                    onClick={() => setShowSettings(false)}
                    className="w-full font-bold text-white rounded-xl shadow-lg mt-4"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
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
