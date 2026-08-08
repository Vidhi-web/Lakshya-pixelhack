'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Timer, 
  BarChart3, 
  Target,
  Map,
  CalendarDays,
  Settings,
  User,
  Lock
} from 'lucide-react';
import toast from 'react-hot-toast';
import { NavSettingsAccountPanels } from './nav-settings-account-panels';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Roadmap', href: '/roadmap', icon: Map },
  { name: 'Planner', href: '/planner', icon: CalendarDays },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Timetable', href: '/timetable', icon: CalendarDays },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [onboardingStatus, setOnboardingStatus] = useState<{ isComplete: boolean; nextStep: string | null } | null>(null);

  useEffect(() => {
    async function fetchOnboarding() {
      try {
        const res = await fetch('/api/user/onboarding-status');
        if (res.ok) {
          const data = await res.json();
          setOnboardingStatus({ isComplete: data.isComplete, nextStep: data.nextStep });
        }
      } catch (err) {
        console.warn('Sidebar onboarding status check failed:', err);
      }
    }
    fetchOnboarding();
  }, [pathname]);

  const isLocked = onboardingStatus !== null && !onboardingStatus.isComplete;

  const handleNavClick = (e: React.MouseEvent, href: string) => {
    if (isLocked) {
      e.preventDefault();
      toast.error('Complete all setup steps first to unlock the platform!', { id: 'nav-locked-toast' });
      router.push(onboardingStatus.nextStep || '/goals');
    }
  };

  return (
    <>
      <aside className="hidden lg:flex lg:flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] z-30">
        <div 
          className="flex flex-col w-64 h-full border-r transition-colors shadow-lg"
          style={{ 
            background: 'var(--theme-background)', 
            borderColor: 'var(--theme-border)' 
          }}
        >
          {/* Logo Header */}
          <div className="flex items-center flex-shrink-0 px-5 pt-6 pb-4">
            <Link 
              href={isLocked ? (onboardingStatus.nextStep || '/goals') : '/dashboard'} 
              onClick={(e) => isLocked && handleNavClick(e, '/dashboard')}
              className="flex items-center gap-2.5 group"
            >
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
              >
                <Target className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold tracking-tight" style={{ color: 'var(--theme-accent)' }}>
                Lakshya
              </span>
              <span className="text-xs opacity-40 ml-1" style={{ color: 'var(--theme-neutral-light)' }}>लक्ष्य</span>
            </Link>
          </div>

          {/* Primary Navigation Links */}
          <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/');

              return (
                <Link
                  key={item.name}
                  href={isLocked ? (onboardingStatus.nextStep || '/goals') : item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`group flex items-center justify-between px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-all ${
                    isActive
                      ? 'shadow-md'
                      : isLocked ? 'opacity-40 cursor-not-allowed hover:bg-white/5' : 'hover:bg-white/10'
                  }`}
                  style={{
                    backgroundColor: isActive ? 'var(--theme-accent)' : 'transparent',
                    color: isActive ? 'var(--theme-neutral-dark)' : 'var(--theme-neutral-light)',
                    opacity: isActive ? 1 : isLocked ? 0.4 : 0.8,
                  }}
                >
                  <div className="flex items-center">
                    <Icon
                      className="mr-3 h-5 w-5 flex-shrink-0 transition-transform group-hover:scale-110"
                      style={{
                        color: isActive ? 'var(--theme-neutral-dark)' : 'var(--theme-accent)',
                      }}
                    />
                    {item.name}
                  </div>

                  {isLocked && !isActive && (
                    <Lock className="w-3.5 h-3.5 opacity-60 text-amber-400" />
                  )}
                </Link>
              );
            })}
          </nav>
          
          {/* Pinned Bottom Settings & Account Section */}
          <div 
            className="flex-shrink-0 p-3 space-y-2 border-t mt-auto"
            style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }}
          >
            {/* Settings Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSettingsOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-full border transition-all glass-card"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--theme-neutral-light)',
              }}
            >
              <span className="flex items-center gap-2.5">
                <Settings className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                Settings
              </span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-white/10">Vibe</span>
            </motion.button>

            {/* Account Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setAccountOpen(true)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-sm font-semibold rounded-full border transition-all glass-card"
              style={{
                borderColor: 'rgba(255, 255, 255, 0.15)',
                color: 'var(--theme-neutral-light)',
              }}
            >
              <span className="flex items-center gap-2.5">
                <User className="w-4 h-4 text-emerald-400" />
                Account & Profile
              </span>
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </motion.button>
          </div>
        </div>
      </aside>

      {/* Slide-in Panels */}
      <NavSettingsAccountPanels
        settingsOpen={settingsOpen}
        accountOpen={accountOpen}
        onCloseSettings={() => setSettingsOpen(false)}
        onCloseAccount={() => setAccountOpen(false)}
      />
    </>
  );
}
