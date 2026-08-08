'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  LayoutDashboard, Map, CheckSquare, Timer, BarChart3, 
  CalendarDays, StickyNote, Calendar, Target, Settings, User
} from 'lucide-react';
import { NavSettingsAccountPanels } from './nav-settings-account-panels';

const dockItems = [
  { name: 'Home', href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { name: 'Roadmap', href: '/roadmap', icon: Map, label: 'Map' },
  { name: 'Planner', href: '/planner', icon: CalendarDays, label: 'Plan' },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare, label: 'Tasks' },
  { name: 'Focus', href: '/pomodoro', icon: Timer, label: 'Focus' },
  { name: 'Stats', href: '/analytics', icon: BarChart3, label: 'Stats' },
];

const railItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Roadmap', href: '/roadmap', icon: Map },
  { name: 'Daily Planner', href: '/planner', icon: CalendarDays },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Timetable', href: '/timetable', icon: Calendar },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  { name: 'Goals', href: '/goals', icon: Target },
];

export function BottomDock() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30, delay: 0.3 }}
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 lg:hidden"
      >
        <div className="nav-dock">
          {dockItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} className={`nav-dock-icon ${isActive ? 'active' : ''}`}>
                <motion.div whileTap={{ scale: 0.85 }} whileHover={{ scale: 1.15 }}>
                  <Icon className="w-5 h-5" />
                </motion.div>
                <span>{item.label}</span>
              </Link>
            );
          })}
          <button onClick={() => setSettingsOpen(true)} className="nav-dock-icon" title="Settings">
            <Settings className="w-5 h-5 text-amber-400" />
            <span>Set</span>
          </button>
          <button onClick={() => setAccountOpen(true)} className="nav-dock-icon" title="Account">
            <User className="w-5 h-5 text-emerald-400" />
            <span>Profile</span>
          </button>
        </div>
      </motion.div>

      <NavSettingsAccountPanels
        settingsOpen={settingsOpen}
        accountOpen={accountOpen}
        onCloseSettings={() => setSettingsOpen(false)}
        onCloseAccount={() => setAccountOpen(false)}
      />
    </>
  );
}

export function IconRail() {
  const pathname = usePathname();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  return (
    <>
      <motion.aside
        initial={{ x: -80, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="icon-rail hidden lg:flex flex-col justify-between"
      >
        <div className="flex flex-col items-center">
          <Link href="/dashboard" className="mb-4 mt-2">
            <motion.div
              whileHover={{ scale: 1.1 }}
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
            >
              <Target className="w-5 h-5 text-white" />
            </motion.div>
          </Link>
          <div className="w-8 h-px bg-white/10 my-1" />
          {railItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link key={item.href} href={item.href} title={item.name} className="relative group my-1">
                <motion.div
                  whileHover={{ scale: 1.15 }}
                  whileTap={{ scale: 0.9 }}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                    isActive ? 'text-white shadow-lg' : 'text-white/40 hover:text-white/80 hover:bg-white/10'
                  }`}
                  style={isActive ? { background: 'var(--theme-accent)', boxShadow: '0 4px 15px rgba(249,177,122,0.4)' } : {}}
                >
                  <Icon className="w-5 h-5" />
                </motion.div>
                <div className="absolute left-14 top-1/2 -translate-y-1/2 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-50">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded-md whitespace-nowrap shadow-lg">{item.name}</div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Pinned Bottom Settings & Account Pills */}
        <div className="flex flex-col items-center pt-3 pb-2 border-t border-white/10 space-y-2">
          <button 
            onClick={() => setSettingsOpen(true)} 
            title="Settings" 
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center transition-transform hover:scale-110"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <Settings className="w-5 h-5 text-amber-400" />
          </button>

          <button 
            onClick={() => setAccountOpen(true)} 
            title="Account Profile" 
            className="w-10 h-10 rounded-full glass-card flex items-center justify-center transition-transform hover:scale-110"
            style={{ borderColor: 'rgba(255, 255, 255, 0.2)' }}
          >
            <User className="w-5 h-5 text-emerald-400" />
          </button>
        </div>
      </motion.aside>

      <NavSettingsAccountPanels
        settingsOpen={settingsOpen}
        accountOpen={accountOpen}
        onCloseSettings={() => setSettingsOpen(false)}
        onCloseAccount={() => setAccountOpen(false)}
      />
    </>
  );
}
