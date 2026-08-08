'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { themes, ThemeName } from '@/lib/theme-config';
import { Check, Palette, Moon, Sun } from 'lucide-react';

/**
 * Compact theme widget for header - opens a popover
 */
export function ThemeWidget() {
  const { theme: currentTheme, mode, setTheme, toggleMode } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-center gap-2"
        title="Change theme"
      >
        <Palette className="w-5 h-5" />
        <span className="text-xl">{themes[currentTheme].emoji}</span>
      </button>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Popover */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-80 glass-card p-4 space-y-4 z-50 shadow-2xl"
              style={{
                background: 'var(--theme-background)',
                borderColor: 'var(--theme-primary)',
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: 'var(--theme-secondary)' }}>
                <h3 className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>
                  Choose Your Vibe
                </h3>
                <button
                  onClick={toggleMode}
                  className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}
                >
                  {mode === 'light' ? (
                    <Moon className="w-4 h-4" />
                  ) : (
                    <Sun className="w-4 h-4" />
                  )}
                </button>
              </div>

              {/* Theme Options */}
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {Object.values(themes).map((themeOption) => {
                  const isSelected = currentTheme === themeOption.id;
                  
                  return (
                    <button
                      key={themeOption.id}
                      onClick={() => handleThemeSelect(themeOption.id)}
                      className={`
                        w-full flex items-center gap-3 p-3 rounded-lg transition-all text-left
                        ${isSelected 
                          ? 'ring-2 ring-offset-2' 
                          : 'hover:scale-[1.02]'
                        }
                      `}
                      style={{
                        backgroundColor: isSelected ? `${themeOption.colors.primary}15` : 'transparent',
                        borderColor: isSelected ? themeOption.colors.primary : themeOption.colors.secondary,
                        borderWidth: '2px',
                        '--tw-ring-color': themeOption.colors.primary,
                      } as any}
                    >
                      {/* Emoji */}
                      <span className="text-2xl flex-shrink-0">{themeOption.emoji}</span>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm" style={{ color: themeOption.colors.primary }}>
                          {themeOption.name}
                        </div>
                        <div className="text-xs opacity-70 truncate" style={{ color: themeOption.colors.neutralDark }}>
                          {themeOption.description}
                        </div>
                      </div>

                      {/* Color Swatches */}
                      <div className="flex gap-1 flex-shrink-0">
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: themeOption.colors.primary }}
                        />
                        <div
                          className="w-4 h-4 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: themeOption.colors.secondary }}
                        />
                        {themeOption.colors.accent && (
                          <div
                            className="w-4 h-4 rounded-full border border-white shadow-sm"
                            style={{ backgroundColor: themeOption.colors.accent }}
                          />
                        )}
                      </div>

                      {/* Check mark */}
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: themeOption.colors.primary }}
                        >
                          <Check className="w-3 h-3 text-white" />
                        </motion.div>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Footer hint */}
              <div className="text-xs text-center pt-2 border-t opacity-60" style={{ borderColor: 'var(--theme-secondary)' }}>
                Theme persists across sessions
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
