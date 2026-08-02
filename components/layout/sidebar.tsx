'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar, 
  StickyNote, 
  Timer, 
  BarChart3, 
  Target,
  Map,
  CalendarDays
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'AI Roadmap', href: '/roadmap', icon: Map },
  { name: 'Tasks', href: '/tasks', icon: CheckSquare },
  { name: 'Timetable', href: '/timetable', icon: CalendarDays },
  { name: 'Calendar', href: '/calendar', icon: Calendar },
  { name: 'Notes', href: '/notes', icon: StickyNote },
  { name: 'Pomodoro', href: '/pomodoro', icon: Timer },
  { name: 'Analytics', href: '/analytics', icon: BarChart3 },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden lg:flex lg:flex-shrink-0">
      <div className="flex flex-col w-64 border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4 mb-6">
            <Target className="w-6 h-6 text-emerald-600" />
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Lakshya
            </span>
          </div>
          <nav className="mt-5 flex-1 px-2 space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-emerald-50 to-teal-50 text-emerald-700 dark:from-emerald-900/20 dark:to-teal-900/20 dark:text-emerald-400'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-emerald-600 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-emerald-400'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-5 w-5 flex-shrink-0 ${
                      isActive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-gray-500 group-hover:text-emerald-600 dark:group-hover:text-emerald-400'
                    }`}
                  />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        
        {/* Footer */}
        <div className="flex-shrink-0 flex border-t border-gray-200 dark:border-gray-800 p-4">
          <div className="flex-1">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Made with ❤️ for Indian students
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}
