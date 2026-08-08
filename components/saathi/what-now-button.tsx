'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Zap, Sparkles, Clock, Target, ArrowRight, Loader2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function WhatNowButton() {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<any>(null);

  const fetchWhatNow = async () => {
    setLoading(true);
    setOpen(true);
    try {
      const res = await fetch('/api/ai/what-now', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ energy_level: 4 }),
      });
      if (res.ok) {
        const data = await res.json();
        setRecommendation(data.recommendation);
      } else {
        throw new Error('Could not fetch recommendation');
      }
    } catch (e) {
      toast.error('Could not connect to Saathi AI. Using smart default recommendation.');
      setRecommendation({
        action: 'Review High-Priority Tasks',
        duration: '25 minutes',
        topic: 'Core Subjects Practice',
        estimatedImpact: '~3% readiness increase',
        reasoning: 'Staying consistent today will keep your streak alive!',
        motivationalNote: 'Small progress beats no progress. Let\'s go! 💪',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={fetchWhatNow}
        size="lg"
        className="font-bold shadow-lg transition-transform hover:scale-105"
        style={{
          backgroundColor: 'var(--theme-accent)',
          color: 'var(--theme-primary)',
        }}
      >
        <Zap className="w-5 h-5 mr-2 animate-bounce text-amber-500" />
        ⚡ What Should I Do Right Now?
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg glass-card border-2" style={{ borderColor: 'var(--theme-primary)' }}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl" style={{ color: 'var(--theme-primary)' }}>
              <Sparkles className="w-6 h-6 text-amber-500" />
              Saathi's Next Action Recommendation
            </DialogTitle>
            <DialogDescription style={{ color: 'var(--theme-neutral-dark)' }}>
              Tailored based on your active goal, deadlines, and current energy level.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <Loader2 className="w-10 h-10 animate-spin text-amber-500" />
              <p className="text-sm font-medium" style={{ color: 'var(--theme-primary)' }}>
                Analyzing your study schedule & goal progress...
              </p>
            </div>
          ) : recommendation ? (
            <div className="space-y-6 py-2">
              <div 
                className="p-5 rounded-2xl border space-y-3"
                style={{ 
                  backgroundColor: 'var(--theme-background-alt)',
                  borderColor: 'var(--theme-secondary)' 
                }}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider px-3 py-1 rounded-full text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
                    Immediate Focus
                  </span>
                  <span className="text-xs font-medium flex items-center gap-1" style={{ color: 'var(--theme-neutral-dark)' }}>
                    <Clock className="w-3.5 h-3.5" />
                    {recommendation.duration}
                  </span>
                </div>

                <h4 className="text-xl font-extrabold" style={{ color: 'var(--theme-primary)' }}>
                  {recommendation.action}
                </h4>

                <p className="text-sm" style={{ color: 'var(--theme-neutral-dark)' }}>
                  {recommendation.reasoning}
                </p>
              </div>

              {/* Stats pill */}
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--theme-secondary)' }}>
                  <div className="text-xs text-gray-500">Target Topic</div>
                  <div className="font-bold text-sm truncate" style={{ color: 'var(--theme-primary)' }}>
                    {recommendation.topic}
                  </div>
                </div>
                <div className="p-3 rounded-xl border" style={{ borderColor: 'var(--theme-secondary)' }}>
                  <div className="text-xs text-gray-500">Estimated Impact</div>
                  <div className="font-bold text-sm text-emerald-600">
                    {recommendation.estimatedImpact}
                  </div>
                </div>
              </div>

              {/* Motivation Note */}
              <div className="p-4 rounded-xl border bg-amber-500/10 border-amber-500/30 text-amber-700 dark:text-amber-300 text-sm font-medium">
                "{recommendation.motivationalNote}"
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
                <Button 
                  onClick={() => setOpen(false)}
                  style={{ backgroundColor: 'var(--theme-primary)', color: 'white' }}
                >
                  Start Mission Now
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
