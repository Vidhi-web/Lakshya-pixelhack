'use client';

import { ThemeSelector } from '@/components/theme-selector';
import { useTheme } from '@/lib/theme-context';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { themes } from '@/lib/theme-config';
import { Sparkles, Target, Zap } from 'lucide-react';

export default function ThemeDemoPage() {
  const { theme, mode } = useTheme();
  const currentTheme = themes[theme];

  return (
    <div className="min-h-screen p-8" style={{
      background: `linear-gradient(135deg, var(--theme-background) 0%, var(--theme-background-alt) 100%)`
    }}>
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold" style={{ color: 'var(--theme-primary)' }}>
            🎨 Lakshya Theme System
          </h1>
          <p className="text-xl" style={{ color: 'var(--theme-neutral-dark)' }}>
            Currently viewing: <strong>{currentTheme.name}</strong> ({mode} mode)
          </p>
        </div>

        {/* Theme Selector */}
        <Card className="p-8 glass-card">
          <ThemeSelector />
        </Card>

        {/* Demo Components */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 - Primary */}
          <Card 
            className="p-6 glass-card hover:scale-105 transition-transform"
            style={{ borderColor: 'var(--theme-primary)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-primary)' }}
              >
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                Primary Card
              </h3>
            </div>
            <p style={{ color: 'var(--theme-neutral-dark)' }}>
              This card uses the primary theme color for branding and emphasis.
            </p>
          </Card>

          {/* Card 2 - Secondary */}
          <Card 
            className="p-6 glass-card hover:scale-105 transition-transform"
            style={{ borderColor: 'var(--theme-secondary)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-secondary)' }}
              >
                <Sparkles className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-primary)' }}>
                Secondary Card
              </h3>
            </div>
            <p style={{ color: 'var(--theme-neutral-dark)' }}>
              This card features the secondary color for supporting elements.
            </p>
          </Card>

          {/* Card 3 - Accent */}
          <Card 
            className="p-6 glass-card hover:scale-105 transition-transform"
            style={{ borderColor: 'var(--theme-accent)' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div 
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ backgroundColor: 'var(--theme-accent)' }}
              >
                <Zap className="w-6 h-6" style={{ color: 'var(--theme-primary)' }} />
              </div>
              <h3 className="text-xl font-bold" style={{ color: 'var(--theme-accent)' }}>
                Accent Card
              </h3>
            </div>
            <p style={{ color: 'var(--theme-neutral-dark)' }}>
              Accent colors draw attention to important actions and highlights.
            </p>
          </Card>
        </div>

        {/* Buttons */}
        <Card className="p-8 glass-card">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--theme-primary)' }}>
            Button Styles
          </h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              style={{ 
                backgroundColor: 'var(--theme-primary)',
                color: 'white'
              }}
            >
              Primary Button
            </Button>
            <Button 
              style={{ 
                backgroundColor: 'var(--theme-accent)',
                color: 'var(--theme-primary)'
              }}
            >
              Accent Button
            </Button>
            <Button 
              variant="outline"
              style={{ 
                borderColor: 'var(--theme-primary)',
                color: 'var(--theme-primary)'
              }}
            >
              Outline Button
            </Button>
          </div>
        </Card>

        {/* Color Palette */}
        <Card className="p-8 glass-card">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--theme-primary)' }}>
            Color Palette
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { name: 'Primary', var: '--theme-primary', color: currentTheme.colors.primary },
              { name: 'Primary Alt', var: '--theme-primary-alt', color: currentTheme.colors.primaryAlt || currentTheme.colors.primary },
              { name: 'Secondary', var: '--theme-secondary', color: currentTheme.colors.secondary },
              { name: 'Accent', var: '--theme-accent', color: currentTheme.colors.accent || currentTheme.colors.secondary },
              { name: 'Neutral Light', var: '--theme-neutral-light', color: currentTheme.colors.neutralLight },
              { name: 'Neutral Dark', var: '--theme-neutral-dark', color: currentTheme.colors.neutralDark },
              { name: 'Background', var: '--theme-background', color: currentTheme.colors.background || currentTheme.colors.neutralLight },
              { name: 'Background Alt', var: '--theme-background-alt', color: currentTheme.colors.backgroundAlt || currentTheme.colors.secondary },
            ].map((item) => (
              <div key={item.var} className="space-y-2">
                <div
                  className="w-full h-24 rounded-lg border-2 border-white shadow-lg"
                  style={{ backgroundColor: item.color }}
                />
                <div className="text-sm">
                  <div className="font-medium">{item.name}</div>
                  <div className="text-gray-500 font-mono text-xs">{item.color}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Back to Home */}
        <div className="text-center">
          <a href="/">
            <Button 
              size="lg"
              style={{ 
                backgroundColor: 'var(--theme-primary)',
                color: 'white'
              }}
            >
              Back to Home
            </Button>
          </a>
        </div>
      </div>
    </div>
  );
}
