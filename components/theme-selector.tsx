'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useTheme } from '@/lib/theme-context';
import { themes, ThemeName } from '@/lib/theme-config';
import { Check } from 'lucide-react';

export function ThemeSelector({ onSelect }: { onSelect?: (theme: ThemeName) => void }) {
  const { theme: currentTheme, setTheme } = useTheme();

  const handleThemeSelect = (themeName: ThemeName) => {
    setTheme(themeName);
    onSelect?.(themeName);
  };

  return (
    <div className="grid grid-cols-5 gap-3">
      {Object.values(themes).map((themeOption) => {
        const isSelected = currentTheme === themeOption.id;
        
        return (
          <motion.button
            key={themeOption.id}
            onClick={() => handleThemeSelect(themeOption.id)}
            className="relative group"
            whileHover={{ scale: 1.08 }}
            whileTap={{ scale: 0.95 }}
            title={themeOption.name}
          >
            {/* Square swatch */}
            <div
              className="aspect-square w-full rounded-xl border-2 overflow-hidden transition-all relative"
              style={{
                borderColor: isSelected ? themeOption.colors.accent : 'rgba(255,255,255,0.12)',
                boxShadow: isSelected ? `0 0 12px ${themeOption.colors.accent}40` : 'none',
              }}
            >
              {/* Gradient fill */}
              <div
                className="absolute inset-0"
                style={{
                  background: `linear-gradient(135deg, ${themeOption.colors.primary} 0%, ${themeOption.colors.accent} 100%)`,
                }}
              />

              {/* Selected checkmark */}
              {isSelected && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute inset-0 flex items-center justify-center bg-black/30"
                >
                  <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center">
                    <Check className="w-4 h-4" style={{ color: themeOption.colors.primary }} />
                  </div>
                </motion.div>
              )}
            </div>

            {/* Label below */}
            <p 
              className="text-[10px] font-semibold mt-1.5 text-center truncate leading-tight"
              style={{ color: 'var(--theme-text-primary)', opacity: isSelected ? 1 : 0.6 }}
            >
              {themeOption.emoji} {themeOption.name.split(' ')[0]}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}

// Compact theme toggle for header/settings
export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center gap-2"
        title="Change theme"
      >
        <span className="text-xl">{themes[theme].emoji}</span>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 mt-2 w-64 glass-card p-4 space-y-3 z-50 shadow-xl"
          >
            <span className="font-semibold text-sm" style={{ color: 'var(--theme-text-primary)' }}>Theme</span>

            <div className="space-y-2">
              {Object.values(themes).map((themeOption) => (
                <button
                  key={themeOption.id}
                  onClick={() => {
                    setTheme(themeOption.id);
                    setIsOpen(false);
                  }}
                  className={`
                    w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left
                    ${theme === themeOption.id 
                      ? 'bg-white/10' 
                      : 'hover:bg-white/5'
                    }
                  `}
                >
                  <span className="text-xl">{themeOption.emoji}</span>
                  <div className="flex-1">
                    <div className="text-sm font-medium" style={{ color: 'var(--theme-text-primary)' }}>{themeOption.name}</div>
                    <div className="text-xs" style={{ color: 'var(--theme-text-secondary)' }}>{themeOption.description}</div>
                  </div>
                  {theme === themeOption.id && (
                    <Check className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </div>
  );
}
