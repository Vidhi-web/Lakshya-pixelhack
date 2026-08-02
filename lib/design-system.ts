// Design System Constants - Use these everywhere

export const colors = {
  // Base
  background: '#ffffff',
  backgroundSecondary: '#f9fafb',
  
  // Text
  textPrimary: '#111827',
  textSecondary: '#6b7280',
  textTertiary: '#9ca3af',
  
  // Borders
  border: '#e5e7eb',
  borderHover: '#d1d5db',
  
  // Accent (blue) - primary actions only
  accent: '#3b82f6',
  accentHover: '#2563eb',
  accentLight: '#eff6ff',
  
  // Status colors (semantic only)
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  
  // Priority colors
  urgent: '#ef4444',
  high: '#f97316',
  medium: '#eab308',
  low: '#6b7280',
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
} as const;

export const typography = {
  pageTitle: {
    fontSize: '32px',
    fontWeight: '700',
    lineHeight: '1.2',
  },
  sectionTitle: {
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '1.3',
  },
  cardTitle: {
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '1.4',
  },
  body: {
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '1.5',
  },
  caption: {
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.4',
  },
} as const;

export const borderRadius = {
  sm: '4px',
  md: '8px',
  lg: '12px',
  full: '9999px',
} as const;

export const shadows = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
} as const;
