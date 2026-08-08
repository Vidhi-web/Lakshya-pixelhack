/**
 * Global Design System & Theme Tokens for Lakshya
 * 5 distinct, cohesive visual themes with automatic contrast adapting for light & dark modes
 */

export type ThemeName = 'midnight-navy' | 'dusty-bloom' | 'emerald-prestige' | 'sakura-mauve' | 'violet-dusk';
export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  primary: string;
  primaryAlt: string;
  secondary: string;
  accent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  background: string;
  backgroundAlt: string;
  surface: string;
  border: string;
  cardBg: string;
  cardBorder: string;
  cardShadow: string;
  neutralLight?: string;
  neutralDark?: string;
}

export interface Theme {
  id: ThemeName;
  name: string;
  description: string;
  colors: ThemeColors;
  defaultMode: ThemeMode;
  emoji: string;
  supportsBoth: boolean;
}

export const themes: Record<ThemeName, Theme> = {
  'midnight-navy': {
    id: 'midnight-navy',
    name: 'Midnight Navy',
    description: 'Deep, focused, professional navy night',
    emoji: '🌙',
    defaultMode: 'dark',
    supportsBoth: true,
    colors: {
      primary: '#2D3250',
      primaryAlt: '#424769',
      secondary: '#676F9D',
      accent: '#F9B17A',
      textPrimary: '#FFFFFF',
      textSecondary: '#CBD5E1',
      textMuted: '#94A3B8',
      background: '#121526',
      backgroundAlt: '#1A1D2E',
      surface: '#252942',
      border: 'rgba(255, 255, 255, 0.12)',
      cardBg: 'rgba(37, 41, 66, 0.75)',
      cardBorder: 'rgba(249, 177, 122, 0.2)',
      cardShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
      neutralLight: '#FFFFFF',
      neutralDark: '#121526',
    },
  },
  'emerald-prestige': {
    id: 'emerald-prestige',
    name: 'Emerald Prestige',
    description: 'Regal, prestige emerald & gold palette',
    emoji: '💎',
    defaultMode: 'light',
    supportsBoth: true,
    colors: {
      primary: '#0F3D34',
      primaryAlt: '#1B5E51',
      secondary: '#2E7D6E',
      accent: '#C8A96A',
      textPrimary: '#061F18',
      textSecondary: '#154237',
      textMuted: '#2C5E51',
      background: '#F2F7F4',
      backgroundAlt: '#E2ECE7',
      surface: '#FFFFFF',
      border: 'rgba(15, 61, 52, 0.18)',
      cardBg: 'rgba(255, 255, 255, 0.88)',
      cardBorder: 'rgba(200, 169, 106, 0.35)',
      cardShadow: '0 8px 24px rgba(15, 61, 52, 0.08)',
      neutralLight: '#061F18',
      neutralDark: '#F2F7F4',
    },
  },
  'violet-dusk': {
    id: 'violet-dusk',
    name: 'Violet Dusk',
    description: 'Dreamy sunset violet & rose gold palette',
    emoji: '🌅',
    defaultMode: 'light',
    supportsBoth: true,
    colors: {
      primary: '#502D55',
      primaryAlt: '#7A3F82',
      secondary: '#935073',
      accent: '#C26D97',
      textPrimary: '#260C2B',
      textSecondary: '#47204F',
      textMuted: '#6E397B',
      background: '#F9F5FA',
      backgroundAlt: '#EFE4F2',
      surface: '#FFFFFF',
      border: 'rgba(80, 45, 85, 0.18)',
      cardBg: 'rgba(255, 255, 255, 0.88)',
      cardBorder: 'rgba(194, 109, 151, 0.35)',
      cardShadow: '0 8px 24px rgba(80, 45, 85, 0.08)',
      neutralLight: '#260C2B',
      neutralDark: '#F9F5FA',
    },
  },
  'dusty-bloom': {
    id: 'dusty-bloom',
    name: 'Dusty Bloom',
    description: 'Soft, creative rose garden palette',
    emoji: '🌸',
    defaultMode: 'light',
    supportsBoth: true,
    colors: {
      primary: '#8A4F5B',
      primaryAlt: '#B87A87',
      secondary: '#D7B1B7',
      accent: '#A65364',
      textPrimary: '#2E161A',
      textSecondary: '#522E35',
      textMuted: '#7A4852',
      background: '#FAF4F5',
      backgroundAlt: '#F5E8EA',
      surface: '#FFFFFF',
      border: 'rgba(138, 79, 91, 0.18)',
      cardBg: 'rgba(255, 255, 255, 0.88)',
      cardBorder: 'rgba(166, 83, 100, 0.35)',
      cardShadow: '0 8px 24px rgba(138, 79, 91, 0.08)',
      neutralLight: '#2E161A',
      neutralDark: '#FAF4F5',
    },
  },
  'sakura-mauve': {
    id: 'sakura-mauve',
    name: 'Sakura Mauve',
    description: 'Moody, aesthetic mauve night palette',
    emoji: '🌺',
    defaultMode: 'dark',
    supportsBoth: false,
    colors: {
      primary: '#C1A0AC',
      primaryAlt: '#806C79',
      secondary: '#E2B8C8',
      accent: '#F4C2D7',
      textPrimary: '#F7EDF2',
      textSecondary: '#D8C2CE',
      textMuted: '#A8929F',
      background: '#16131F',
      backgroundAlt: '#251F33',
      surface: '#2F2740',
      border: 'rgba(226, 184, 200, 0.18)',
      cardBg: 'rgba(47, 39, 64, 0.75)',
      cardBorder: 'rgba(244, 194, 215, 0.25)',
      cardShadow: '0 12px 32px rgba(0, 0, 0, 0.35)',
      neutralLight: '#F7EDF2',
      neutralDark: '#16131F',
    },
  },
};

export const defaultTheme: ThemeName = 'midnight-navy';
