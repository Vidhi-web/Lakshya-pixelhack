'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { ThemeName, ThemeMode, defaultTheme, themes } from './theme-config';

interface ThemeContextType {
  theme: ThemeName;
  mode?: ThemeMode;
  setTheme: (theme: ThemeName) => void;
  setMode?: (mode: ThemeMode) => void;
  toggleMode?: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<ThemeName>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  // Load theme from localStorage and API on mount
  useEffect(() => {
    setMounted(true);
    
    // 1. Load from localStorage for instant UI apply
    const savedTheme = localStorage.getItem('lakshya-theme') as ThemeName | null;
    
    if (savedTheme && themes[savedTheme]) {
      setThemeState(savedTheme);
    }

    // 2. Load from API for authenticated users
    fetch('/api/user/theme')
      .then(res => {
        if (res.ok) return res.json();
        throw new Error('Not authenticated');
      })
      .then(data => {
        if (data.theme_name && themes[data.theme_name as ThemeName]) {
          setThemeState(data.theme_name as ThemeName);
        }
      })
      .catch(() => {
        // Fallback to local storage values
      });
  }, []);

  // Apply pure theme tokens to document root
  useEffect(() => {
    const root = document.documentElement;
    const themeConfig = themes[theme] || themes[defaultTheme];
    
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-mode', themeConfig.defaultMode);
    
    if (themeConfig.defaultMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    const { colors } = themeConfig;

    // Primary Lakshya Semantic Global CSS Variables
    root.style.setProperty('--theme-primary', colors.primary);
    root.style.setProperty('--theme-primary-alt', colors.primaryAlt);
    root.style.setProperty('--theme-secondary', colors.secondary);
    root.style.setProperty('--theme-accent', colors.accent);
    root.style.setProperty('--theme-neutral-light', colors.textPrimary);
    root.style.setProperty('--theme-neutral-dark', colors.background);
    
    root.style.setProperty('--theme-text-primary', colors.textPrimary);
    root.style.setProperty('--theme-text-secondary', colors.textSecondary);
    root.style.setProperty('--theme-text-muted', colors.textMuted);
    
    root.style.setProperty('--theme-background', colors.background);
    root.style.setProperty('--theme-background-alt', colors.backgroundAlt);
    root.style.setProperty('--theme-surface', colors.surface);
    root.style.setProperty('--theme-border', colors.border);

    root.style.setProperty('--theme-card-bg', colors.cardBg);
    root.style.setProperty('--theme-card-border', colors.cardBorder);
    root.style.setProperty('--theme-card-shadow', colors.cardShadow);

    // Component Design System Mappings
    root.style.setProperty('--background', colors.background);
    root.style.setProperty('--foreground', colors.textPrimary);
    root.style.setProperty('--card', colors.cardBg);
    root.style.setProperty('--card-foreground', colors.textPrimary);
    root.style.setProperty('--popover', colors.surface);
    root.style.setProperty('--popover-foreground', colors.textPrimary);
    root.style.setProperty('--primary', colors.primary);
    root.style.setProperty('--primary-foreground', themeConfig.defaultMode === 'dark' ? '#FFFFFF' : '#000000');
    root.style.setProperty('--secondary', colors.secondary);
    root.style.setProperty('--secondary-foreground', colors.textPrimary);
    root.style.setProperty('--muted', colors.backgroundAlt);
    root.style.setProperty('--muted-foreground', colors.textSecondary);
    root.style.setProperty('--accent', colors.accent);
    root.style.setProperty('--accent-foreground', colors.textPrimary);
    root.style.setProperty('--border', colors.border);
    root.style.setProperty('--input', colors.border);
    root.style.setProperty('--ring', colors.accent);

    // Save to localStorage
    localStorage.setItem('lakshya-theme', theme);

    // Sync to API (async, non-blocking)
    fetch('/api/user/theme', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ theme_name: theme, theme_mode: themeConfig.defaultMode }),
    }).catch(() => {});
  }, [theme]);

  const setTheme = (newTheme: ThemeName) => {
    if (!themes[newTheme]) return;
    setThemeState(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      mode: themes[theme]?.defaultMode || 'dark', 
      setMode: () => {}, 
      toggleMode: () => {} 
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
