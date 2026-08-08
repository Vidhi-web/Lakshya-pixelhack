'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { ThemeToggle as MultiThemeToggle } from '@/components/theme-selector';

// Simple light/dark toggle (backwards compatible)
export function ThemeToggle() {
  // Use the new multi-theme system
  return <MultiThemeToggle />;
}

// Standalone light/dark only toggle (if needed elsewhere)
export function LightDarkToggle() {
  const { mode, toggleMode } = useTheme();

  return (
    <button
      onClick={toggleMode}
      className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
      title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
    >
      {mode === 'light' ? (
        <Moon className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      ) : (
        <Sun className="w-5 h-5 text-gray-700 dark:text-gray-300" />
      )}
    </button>
  );
}
