'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, CheckCircle2, ChevronRight, Sparkles, Map, Database, Brain, Stethoscope, Briefcase, GraduationCap, Rocket, ArrowLeft, AlertTriangle } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { ThemeName, themes } from '@/lib/theme-config';

const GOALS = [
  { id: 'placement', title: 'Campus Placements', icon: Briefcase, color: 'from-blue-500 to-indigo-500', bg: 'bg-blue-500/10' },
  { id: 'startup', title: 'Launch Startup / Business', icon: Rocket, color: 'from-amber-500 to-yellow-500', bg: 'bg-amber-500/10' },
  { id: 'gate', title: 'GATE Exam Prep', icon: Map, color: 'from-orange-500 to-red-500', bg: 'bg-orange-500/10' },
  { id: 'dsa', title: 'DSA & Coding Mastery', icon: Database, color: 'from-emerald-500 to-teal-500', bg: 'bg-emerald-500/10' },
  { id: 'higher_studies', title: 'MS / PhD Applications', icon: GraduationCap, color: 'from-cyan-500 to-blue-500', bg: 'bg-cyan-500/10' },
  { id: 'upsc', title: 'UPSC / Civil Services', icon: Brain, color: 'from-purple-500 to-pink-500', bg: 'bg-purple-500/10' },
  { id: 'neet', title: 'NEET / Medical Prep', icon: Stethoscope, color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10' },
  { id: 'custom', title: 'Custom Goal / Ambition', icon: Sparkles, color: 'from-slate-500 to-gray-500', bg: 'bg-gray-500/10' },
];

function GoalsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reasonParam = searchParams.get('reason');
  const fromGoal = searchParams.get('fromGoal');

  const { setTheme } = useTheme();
  
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [selectedTheme, setSelectedThemeState] = useState<ThemeName | null>(null);

  const handleNext = () => {
    if (step === 1 && selectedGoal) {
      setStep(2);
    }
  };

  const handleFinish = async () => {
    if (selectedTheme && selectedGoal) {
      setTheme(selectedTheme);
      try {
        await fetch('/api/goals/select', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ goalType: selectedGoal }),
        });
      } catch (e) {
        console.warn('Error setting active goal:', e);
      }
      router.push(`/personalize?goal=${selectedGoal}`);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'var(--theme-background)' }}>
      <div className="max-w-4xl mx-auto">
        {reasonParam === 'mismatch' && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 rounded-2xl bg-amber-500/15 border border-amber-500/40 text-amber-300 flex items-center gap-3 shadow-lg"
          >
            <AlertTriangle className="w-5 h-5 shrink-0 text-amber-400" />
            <p className="text-xs font-extrabold leading-relaxed">
              You are updating your goal category because your target input didn't match {fromGoal ? fromGoal.toUpperCase() : 'your previous selection'}.
            </p>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8"
            >
              <div className="text-center space-y-4">
                <motion.div
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring" }}
                  className="w-16 h-16 mx-auto rounded-2xl flex items-center justify-center mb-4 shadow-xl"
                  style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                >
                  <Target className="w-8 h-8 text-white" />
                </motion.div>

                <h1 className="text-4xl md:text-5xl font-black tracking-tight" style={{ color: 'var(--theme-text-primary)' }}>
                  What is your primary focus?
                </h1>
                <p className="text-sm md:text-base opacity-70 max-w-xl mx-auto font-medium" style={{ color: 'var(--theme-text-primary)' }}>
                  Select your primary objective so Saathi AI can tailor your roadmap, daily tasks, and study schedule.
                </p>
              </div>

              {/* Grid of Goals */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {GOALS.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;

                  return (
                    <motion.div
                      key={goal.id}
                      whileHover={{ scale: 1.03, y: -4 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedGoal(goal.id)}
                      className={`relative p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between h-44 shadow-lg ${
                        isSelected 
                          ? 'border-[var(--theme-accent)] bg-white/10 shadow-2xl scale-[1.02]' 
                          : 'border-white/10 hover:border-white/30 glass-card'
                      }`}
                      style={{
                        borderColor: isSelected ? 'var(--theme-accent)' : 'var(--theme-border)',
                        background: isSelected ? 'var(--theme-surface)' : 'var(--theme-background-alt)',
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 text-[var(--theme-accent)]">
                          <CheckCircle2 className="w-6 h-6 fill-[var(--theme-accent)] text-black" />
                        </div>
                      )}

                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${goal.color} text-white shadow-md mb-3`}>
                        <Icon className="w-6 h-6" />
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                          {goal.title}
                        </h3>
                        <p className="text-[11px] opacity-60 font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                          Click to select
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Next Step Action Button */}
              <div className="flex justify-end pt-4">
                <button
                  onClick={handleNext}
                  disabled={!selectedGoal}
                  className={`px-8 py-3.5 rounded-2xl font-extrabold text-white flex items-center gap-2 transition-all shadow-xl ${
                    selectedGoal 
                      ? 'hover:scale-105 cursor-pointer opacity-100' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)',
                  }}
                >
                  <span>Continue to Workspace Vibe</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center gap-4 mb-4">
                <button 
                  onClick={() => setStep(1)}
                  className="p-2 rounded-xl border glass-card hover:scale-105 transition-transform"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-3xl font-black" style={{ color: 'var(--theme-text-primary)' }}>
                    Choose Your Workspace Vibe
                  </h1>
                  <p className="text-xs opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
                    Select your visual theme preference for Lakshya.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {(Object.keys(themes) as ThemeName[]).map((themeKey) => {
                  const t = themes[themeKey];
                  const isSelected = selectedTheme === themeKey;

                  return (
                    <motion.div
                      key={themeKey}
                      whileHover={{ scale: 1.03 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setSelectedThemeState(themeKey)}
                      className={`p-5 rounded-3xl border-2 cursor-pointer transition-all flex flex-col justify-between h-40 shadow-lg relative ${
                        isSelected ? 'scale-[1.02]' : ''
                      }`}
                      style={{
                        borderColor: isSelected ? t.colors.accent : 'var(--theme-border)',
                        background: t.colors.background,
                        color: t.colors.textPrimary,
                      }}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3">
                          <CheckCircle2 className="w-5 h-5 fill-emerald-400 text-black" />
                        </div>
                      )}

                      <div>
                        <span className="text-[10px] font-black uppercase tracking-wider opacity-60">Theme</span>
                        <h3 className="text-lg font-black mt-1" style={{ color: t.colors.textPrimary }}>
                          {t.name}
                        </h3>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-white/10">
                        <div className="w-5 h-5 rounded-full" style={{ background: t.colors.primary }} />
                        <div className="w-5 h-5 rounded-full" style={{ background: t.colors.accent }} />
                        <div className="w-5 h-5 rounded-full border border-white/20" style={{ background: t.colors.background }} />
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              <div className="flex justify-between items-center pt-6">
                <button
                  onClick={() => setStep(1)}
                  className="px-6 py-3 rounded-2xl font-bold border glass-card"
                  style={{ borderColor: 'var(--theme-border)', color: 'var(--theme-text-primary)' }}
                >
                  Back
                </button>
                <button
                  onClick={handleFinish}
                  disabled={!selectedTheme}
                  className={`px-8 py-3.5 rounded-2xl font-extrabold text-white flex items-center gap-2 transition-all shadow-xl ${
                    selectedTheme 
                      ? 'hover:scale-105 cursor-pointer opacity-100' 
                      : 'opacity-40 cursor-not-allowed'
                  }`}
                  style={{
                    background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)',
                  }}
                >
                  <span>Lock In Goal & Personalize</span>
                  <Sparkles className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

export default function GoalsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <div className="w-8 h-8 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--theme-accent)' }} />
      </div>
    }>
      <GoalsContent />
    </Suspense>
  );
}
