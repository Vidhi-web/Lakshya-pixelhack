'use client';

import { ThemeProvider } from './theme-context';

export function ClientThemeProvider({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
