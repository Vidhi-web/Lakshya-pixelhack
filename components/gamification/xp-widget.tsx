'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Flame, Zap, Award, Sparkles } from 'lucide-react';

interface XPWidgetProps {
  totalXp: number;
  currentLevel: number;
  xpProgressInLevel: number;
  xpForNextLevel: number;
  currentStreak: number;
  longestStreak: number;
  comebackMessage?: string;
}

export function XPWidget({
  totalXp = 450,
  currentLevel = 3,
  xpProgressInLevel = 150,
  xpForNextLevel = 250,
  currentStreak = 5,
  longestStreak = 7,
  comebackMessage = "🔥 Keep climbing! You are 100 XP away from Level 4.",
}: Partial<XPWidgetProps>) {
  const progressPercent = Math.min(
    100,
    Math.round((xpProgressInLevel / Math.max(1, xpForNextLevel)) * 100)
  );

  return (
    <Card 
      className="p-6 glass-card border-2 relative overflow-hidden transition-all hover:shadow-lg"
      style={{ borderColor: 'var(--theme-primary)' }}
    >
      {/* Decorative Accent Glow */}
      <div 
        className="absolute -top-12 -right-12 w-32 h-32 rounded-full blur-2xl opacity-30 pointer-events-none"
        style={{ backgroundColor: 'var(--theme-accent)' }}
      />

      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
        {/* Level Badge & XP */}
        <div className="flex items-center gap-3">
          <div 
            className="w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md transform transition-transform hover:scale-105"
            style={{ 
              background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-primary-alt) 100%)' 
            }}
          >
            L{currentLevel}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>
                Level {currentLevel} Scholar
              </h3>
              <Badge 
                variant="outline" 
                className="text-xs px-2 py-0.5"
                style={{ 
                  borderColor: 'var(--theme-accent)', 
                  color: 'var(--theme-accent)' 
                }}
              >
                <Sparkles className="w-3 h-3 mr-1 inline" />
                {totalXp} XP Total
              </Badge>
            </div>
            <p className="text-xs" style={{ color: 'var(--theme-neutral-dark)' }}>
              {xpProgressInLevel} / {xpForNextLevel} XP to Level {currentLevel + 1}
            </p>
          </div>
        </div>

        {/* Streak Pill */}
        <div className="flex items-center gap-4">
          <div 
            className="flex items-center gap-2 px-4 py-2 rounded-xl border shadow-sm"
            style={{ 
              backgroundColor: 'var(--theme-background-alt)',
              borderColor: 'var(--theme-secondary)' 
            }}
          >
            <Flame className="w-5 h-5 text-amber-500 animate-pulse" />
            <div>
              <div className="text-sm font-bold leading-tight" style={{ color: 'var(--theme-primary)' }}>
                {currentStreak} Day Streak
              </div>
              <div className="text-[10px]" style={{ color: 'var(--theme-neutral-dark)' }}>
                Best: {longestStreak} days
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Level XP Progress Bar */}
      <div className="space-y-1.5 mb-3">
        <Progress 
          value={progressPercent} 
          className="h-3 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--theme-neutral-light)' }}
        />
      </div>

      {/* Comeback / Motivation Banner */}
      {comebackMessage && (
        <div 
          className="text-xs p-2.5 rounded-lg border flex items-center gap-2 mt-2"
          style={{ 
            backgroundColor: 'var(--theme-background)',
            borderColor: 'var(--theme-secondary)',
            color: 'var(--theme-primary)'
          }}
        >
          <Zap className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--theme-accent)' }} />
          <span>{comebackMessage}</span>
        </div>
      )}
    </Card>
  );
}
