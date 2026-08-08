'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Loader2, ChevronRight, ChevronLeft, Calendar, Clock, 
  Brain, Target, TrendingUp, Heart, BookOpen, GraduationCap, Sparkles, AlertTriangle
} from 'lucide-react';
import { motion } from 'framer-motion';

interface PersonalizationData {
  currentLevel: string;
  weakSubjects: string[];
  strongSubjects: string[];
  dailyAvailableHours: number;
  preferredStudyTime: string;
  weekendAvailability: string;
  hasCollegeSchedule: boolean;
  collegeHoursPerWeek: number;
  examDate: string;
  targetRankScore: string;
  stressLevel: number;
}

const getGoalLabels = (goalId: string) => {
  const normalized = (goalId || '').toLowerCase();
  
  if (normalized.includes('placement') || normalized.includes('job') || normalized.includes('career')) {
    return {
      stepTitle: 'Placement & Career Target',
      stepDesc: 'Define your target company and placement timeline',
      dateLabel: 'Target Placement Drive / Hiring Date *',
      targetLabel: 'Target Company / Offer Goal *',
      placeholder: 'e.g., SDE-1 at Amazon, Tier-1 Product Company Offer, 15+ LPA',
      targetSubtext: 'What is your primary placement target?',
    };
  }

  if (normalized.includes('startup') || normalized.includes('business')) {
    return {
      stepTitle: 'Startup & Launch Target',
      stepDesc: 'Define your business launch timeline and key milestone',
      dateLabel: 'Target Product Launch Date *',
      targetLabel: 'Startup Milestone Goal *',
      placeholder: 'e.g., Launch MVP & Acquire First 100 Paying Users',
      targetSubtext: 'What is your primary startup milestone?',
    };
  }

  if (normalized.includes('dsa') || normalized.includes('coding')) {
    return {
      stepTitle: 'Coding & Skill Target',
      stepDesc: 'Define your skill completion timeline and target rating',
      dateLabel: 'Target Mastery Date *',
      targetLabel: 'Target Coding Milestone Goal *',
      placeholder: 'e.g., Solve 300+ LeetCode Medium/Hard, Guardian Rating',
      targetSubtext: 'What is your primary coding achievement target?',
    };
  }

  if (normalized.includes('higher') || normalized.includes('ms') || normalized.includes('phd')) {
    return {
      stepTitle: 'Higher Studies & Application Target',
      stepDesc: 'Define your university application deadline and target',
      dateLabel: 'Target Application Deadline *',
      targetLabel: 'Target University / GRE Goal *',
      placeholder: 'e.g., Top 20 US Universities, GRE Score 325+',
      targetSubtext: 'What is your primary university target?',
    };
  }

  // Default for Competitive Exams (UPSC, GATE, NEET, JEE, CAT)
  return {
    stepTitle: 'Exam & Target Rank',
    stepDesc: 'Define your target exam date and score goal',
    dateLabel: 'Target Exam Date *',
    targetLabel: 'Target Rank / Score Goal *',
    placeholder: 'e.g., AIR under 200, 99.5+ Percentile',
    targetSubtext: 'What is your primary exam rank target?',
  };
};

function PersonalizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawGoal = searchParams.get('goalId') || searchParams.get('goal') || 'placement';
  const goalId = rawGoal;
  const goalLabels = getGoalLabels(goalId);

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [validatingGoal, setValidatingGoal] = useState(false);
  const [error, setError] = useState('');
  const [mismatchError, setMismatchError] = useState<{ message: string; reason: string } | null>(null);

  const [formData, setFormData] = useState<PersonalizationData>({
    currentLevel: '',
    weakSubjects: [],
    strongSubjects: [],
    dailyAvailableHours: 4,
    preferredStudyTime: 'flexible',
    weekendAvailability: 'full',
    hasCollegeSchedule: false,
    collegeHoursPerWeek: 0,
    examDate: '',
    targetRankScore: '',
    stressLevel: 3,
  });

  const [tempWeakSubjects, setTempWeakSubjects] = useState('');
  const [tempStrongSubjects, setTempStrongSubjects] = useState('');

  const totalSteps = 5;
  const progressPercentage = (step / totalSteps) * 100;

  const handleNext = async () => {
    if (!validateStep()) return;

    // Step 4: Semantic check between Goal Category and Target Input
    if (step === 4) {
      setValidatingGoal(true);
      setError('');
      setMismatchError(null);

      try {
        const res = await fetch('/api/ai/validate-goal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            goalType: goalId,
            targetInput: formData.targetRankScore,
          }),
        });

        const data = await res.json().catch(() => ({ valid: true }));

        if (!res.ok || data.valid === false) {
          setMismatchError({
            message: `This target input doesn't match your selected ${goalId.toUpperCase()} goal category. Did you mean to edit this target field or change your goal category?`,
            reason: data.reason || data.error || 'The target input belongs to a different exam/career track.',
          });
          setValidatingGoal(false);
          return; // PIN TO STEP 4! Do not advance
        }
      } catch (err) {
        console.warn('Semantic goal validation warning:', err);
      } finally {
        setValidatingGoal(false);
      }
    }

    setStep((prev) => Math.min(prev + 1, totalSteps));
    setError('');
    setMismatchError(null);
  };

  const handleBack = () => {
    setStep((prev) => Math.max(prev - 1, 1));
    setError('');
    setMismatchError(null);
  };

  const validateStep = (): boolean => {
    switch (step) {
      case 1:
        if (!formData.currentLevel.trim()) {
          setError('Please specify your current academic status (e.g., 3rd Year BTech CSE, Working Professional)');
          return false;
        }
        return true;
      case 2:
        if (formData.dailyAvailableHours <= 0 || isNaN(formData.dailyAvailableHours)) {
          setError('Please enter valid daily study hours (between 1 and 18 hours per day)');
          return false;
        }
        return true;
      case 3:
        if (formData.hasCollegeSchedule && (formData.collegeHoursPerWeek <= 0 || isNaN(formData.collegeHoursPerWeek))) {
          setError('Please specify your weekly college/office commitment hours (between 1 and 80 hours)');
          return false;
        }
        return true;
      case 4:
        if (!formData.examDate) {
          setError(`Please select a valid ${goalLabels.dateLabel.replace(' *', '').toLowerCase()}`);
          return false;
        }
        if (!formData.targetRankScore.trim()) {
          setError(`Please enter your ${goalLabels.targetLabel.replace(' *', '').toLowerCase()}`);
          return false;
        }
        return true;
      case 5:
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    if (mismatchError) {
      setError('Please fix the goal target mismatch on Step 4 before completing setup.');
      setStep(4);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const weakSubjectsArray = tempWeakSubjects
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const strongSubjectsArray = tempStrongSubjects
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s.length > 0);

      const personalizeRes = await fetch('/api/personalization', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          weakSubjects: weakSubjectsArray,
          strongSubjects: strongSubjectsArray,
          goalId: goalId,
        }),
      });

      if (!personalizeRes.ok) {
        const personalizeErr = await personalizeRes.json().catch(() => ({}));
        throw new Error(personalizeErr.error || 'Failed to save personalization preferences');
      }

      const roadmapRes = await fetch('/api/generate-roadmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goalType: goalId || 'placement',
          userInput: formData.targetRankScore,
        }),
      });

      if (!roadmapRes.ok) {
        const roadmapErr = await roadmapRes.json().catch(() => ({}));
        if (roadmapErr.error && roadmapErr.error.includes('does not match')) {
          setMismatchError({
            message: `This target input doesn't match your selected ${goalId.toUpperCase()} goal category. Did you mean to edit this target field or change your goal category?`,
            reason: roadmapErr.reason || roadmapErr.error,
          });
          setStep(4);
          setLoading(false);
          return;
        }
        throw new Error(roadmapErr.error || 'Failed to generate AI roadmap');
      }

      if (typeof window !== 'undefined') {
        sessionStorage.setItem('lakshya_onboarding_complete', 'true');
      }
      router.push('/dashboard');
      router.refresh();
    } catch (err: any) {
      console.error('Error saving personalization:', err);
      setError(err.message || 'Failed to save your preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const STRESS_LEVELS = [
    { level: 1, label: 'Relaxed', desc: 'Low stress, steady pace', icon: '😌', color: '#10b981' },
    { level: 2, label: 'Balanced', desc: 'Optimal focus', icon: '🙂', color: '#3b82f6' },
    { level: 3, label: 'Moderate', desc: 'Noticeable pressure', icon: '😐', color: '#f59e0b' },
    { level: 4, label: 'High', desc: 'Demanding schedule', icon: '😟', color: '#f97316' },
    { level: 5, label: 'Intense', desc: 'Critical deadline push', icon: '⚡', color: '#ef4444' },
  ];

  return (
    <div className="min-h-screen py-12 px-4 transition-colors" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
      <div className="container mx-auto max-w-2xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div 
            className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 shadow-xl border"
            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)', borderColor: 'var(--theme-border)' }}
          >
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2" style={{ color: 'var(--theme-text-primary)' }}>
            Personalize Your Engine
          </h1>
          <p className="text-sm opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
            Selected Category: <strong className="uppercase font-black" style={{ color: 'var(--theme-accent)' }}>{goalId}</strong>
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2 text-xs font-extrabold uppercase tracking-wider opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
            <span>Step {step} of {totalSteps}</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="h-2 w-full rounded-full overflow-hidden" style={{ background: 'var(--theme-border)' }}>
            <motion.div 
              className="h-full rounded-full"
              style={{ background: 'linear-gradient(90deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Form Card */}
        <Card className="glass-card shadow-2xl border-2 rounded-3xl" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-background-alt)' }}>
          <CardHeader className="pb-4 border-b" style={{ borderColor: 'var(--theme-border)' }}>
            <CardTitle className="flex items-center gap-3 text-xl font-extrabold" style={{ color: 'var(--theme-text-primary)' }}>
              {step === 1 && (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--theme-accent)' }}>
                    <GraduationCap className="w-5 h-5" />
                  </div>
                  Academic Background
                </>
              )}
              {step === 2 && (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--theme-accent)' }}>
                    <Clock className="w-5 h-5" />
                  </div>
                  Study Preferences
                </>
              )}
              {step === 3 && (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--theme-accent)' }}>
                    <BookOpen className="w-5 h-5" />
                  </div>
                  Academic Commitments
                </>
              )}
              {step === 4 && (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--theme-accent)' }}>
                    <Target className="w-5 h-5" />
                  </div>
                  {goalLabels.stepTitle}
                </>
              )}
              {step === 5 && (
                <>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ background: 'var(--theme-accent)' }}>
                    <Heart className="w-5 h-5" />
                  </div>
                  Wellbeing & Focus Check
                </>
              )}
            </CardTitle>
            <CardDescription className="opacity-70 text-xs mt-1" style={{ color: 'var(--theme-text-primary)' }}>
              {step === 1 && 'Tell us about your current academic status'}
              {step === 2 && 'Help us understand your optimal study schedule'}
              {step === 3 && 'Share your college/office time commitments'}
              {step === 4 && goalLabels.stepDesc}
              {step === 5 && "Calibrate workload to prevent burnout"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6 space-y-6">
            {/* Step 1: Academic Background */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentLevel" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Current Level *</Label>
                  <Input
                    id="currentLevel"
                    placeholder="e.g., 3rd Year BTech CSE, Final Year, Working Professional"
                    value={formData.currentLevel}
                    onChange={(e) => {
                      setFormData({ ...formData, currentLevel: e.target.value });
                      if (error) setError('');
                    }}
                    className={`mt-1.5 rounded-xl font-semibold ${error && !formData.currentLevel.trim() ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
                    style={{ color: 'var(--theme-text-primary)', borderColor: error && !formData.currentLevel.trim() ? '#ef4444' : 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  {error && !formData.currentLevel.trim() && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="weakSubjects" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Weak Subjects (comma separated)</Label>
                  <Input
                    id="weakSubjects"
                    placeholder="e.g., Algorithms, Operating Systems, DBMS"
                    value={tempWeakSubjects}
                    onChange={(e) => setTempWeakSubjects(e.target.value)}
                    className="mt-1.5 rounded-xl font-semibold"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>Topics that require extra attention and practice</p>
                </div>
                <div>
                  <Label htmlFor="strongSubjects" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Strong Subjects (comma separated)</Label>
                  <Input
                    id="strongSubjects"
                    placeholder="e.g., Data Structures, Computer Networks, Aptitude"
                    value={tempStrongSubjects}
                    onChange={(e) => setTempStrongSubjects(e.target.value)}
                    className="mt-1.5 rounded-xl font-semibold"
                    style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>Subjects you are most confident in</p>
                </div>
              </div>
            )}

            {/* Step 2: Study Preferences */}
            {step === 2 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="dailyHours" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Daily Available Study Hours *</Label>
                  <Input
                    id="dailyHours"
                    type="number"
                    min="1"
                    max="18"
                    step="0.5"
                    value={isNaN(formData.dailyAvailableHours) || formData.dailyAvailableHours === 0 ? '' : formData.dailyAvailableHours}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setFormData({ ...formData, dailyAvailableHours: isNaN(val) ? 0 : val });
                      if (error) setError('');
                    }}
                    className={`mt-1.5 rounded-xl font-semibold ${error && (formData.dailyAvailableHours <= 0 || isNaN(formData.dailyAvailableHours)) ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
                    style={{ color: 'var(--theme-text-primary)', borderColor: error && (formData.dailyAvailableHours <= 0 || isNaN(formData.dailyAvailableHours)) ? '#ef4444' : 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  {error && (formData.dailyAvailableHours <= 0 || isNaN(formData.dailyAvailableHours)) && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}
                  <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>How many hours per day can you dedicate to focused learning?</p>
                </div>
                <div>
                  <Label htmlFor="preferredTime" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Preferred Study Time *</Label>
                  <select
                    id="preferredTime"
                    value={formData.preferredStudyTime}
                    onChange={(e) => setFormData({ ...formData, preferredStudyTime: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={{ 
                      background: 'var(--theme-background)', 
                      color: 'var(--theme-text-primary)', 
                      borderColor: 'var(--theme-border)' 
                    }}
                  >
                    <option value="morning">Morning (5 AM - 11 AM)</option>
                    <option value="afternoon">Afternoon (12 PM - 4 PM)</option>
                    <option value="evening">Evening (5 PM - 8 PM)</option>
                    <option value="night">Night (9 PM - 1 AM)</option>
                    <option value="flexible">Flexible</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="weekendAvail" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>Weekend Availability *</Label>
                  <select
                    id="weekendAvail"
                    value={formData.weekendAvailability}
                    onChange={(e) => setFormData({ ...formData, weekendAvailability: e.target.value })}
                    className="w-full mt-1.5 px-3 py-2.5 rounded-xl border text-sm font-semibold transition-colors"
                    style={{ 
                      background: 'var(--theme-background)', 
                      color: 'var(--theme-text-primary)', 
                      borderColor: 'var(--theme-border)' 
                    }}
                  >
                    <option value="full">Full availability</option>
                    <option value="partial">Partial (few hours)</option>
                    <option value="none">None (busy on weekends)</option>
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Academic Commitments */}
            {step === 3 && (
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-2xl border flex items-center gap-3 cursor-pointer transition-all hover:bg-white/5"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-background)' }}
                  onClick={() => setFormData({ ...formData, hasCollegeSchedule: !formData.hasCollegeSchedule })}
                >
                  <input
                    type="checkbox"
                    id="hasCollege"
                    checked={formData.hasCollegeSchedule}
                    onChange={(e) => setFormData({ ...formData, hasCollegeSchedule: e.target.checked })}
                    className="w-5 h-5 rounded cursor-pointer accent-[var(--theme-accent)]"
                  />
                  <Label htmlFor="hasCollege" className="cursor-pointer font-bold text-sm" style={{ color: 'var(--theme-text-primary)' }}>
                    I have regular college/office commitments
                  </Label>
                </div>

                {formData.hasCollegeSchedule && (
                  <div>
                    <Label htmlFor="collegeHours" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>College/Office Hours Per Week *</Label>
                    <Input
                      id="collegeHours"
                      type="number"
                      min="1"
                      max="80"
                      step="1"
                      value={isNaN(formData.collegeHoursPerWeek) || formData.collegeHoursPerWeek === 0 ? '' : formData.collegeHoursPerWeek}
                      onChange={(e) => {
                        const parsed = parseFloat(e.target.value);
                        setFormData({ ...formData, collegeHoursPerWeek: isNaN(parsed) ? 0 : parsed });
                        if (error) setError('');
                      }}
                      className={`mt-1.5 rounded-xl font-semibold ${error && (formData.collegeHoursPerWeek <= 0 || isNaN(formData.collegeHoursPerWeek)) ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
                      style={{ color: 'var(--theme-text-primary)', borderColor: error && (formData.collegeHoursPerWeek <= 0 || isNaN(formData.collegeHoursPerWeek)) ? '#ef4444' : 'var(--theme-border)', background: 'var(--theme-background)' }}
                    />
                    {error && (formData.collegeHoursPerWeek <= 0 || isNaN(formData.collegeHoursPerWeek)) && (
                      <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> {error}
                      </p>
                    )}
                    <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>
                      Total hours per week spent in lectures or work
                    </p>
                  </div>
                )}

                <div className="p-4 rounded-2xl border glass-card" style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}>
                  <p className="text-xs font-semibold leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                    💡 <strong>Smart Balance:</strong> Saathi AI will automatically adjust your daily task count to prevent schedule collisions.
                  </p>
                </div>
              </div>
            )}

            {/* Step 4: Dynamic Goal & Timeline (Customized per Goal Category) */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="examDate" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
                    {goalLabels.dateLabel}
                  </Label>
                  <Input
                    id="examDate"
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    value={formData.examDate}
                    onChange={(e) => {
                      setFormData({ ...formData, examDate: e.target.value });
                      if (error) setError('');
                    }}
                    className={`mt-1.5 rounded-xl font-semibold ${error && !formData.examDate ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
                    style={{ color: 'var(--theme-text-primary)', borderColor: error && !formData.examDate ? '#ef4444' : 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  {error && !formData.examDate && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="targetRank" className="text-xs font-bold uppercase tracking-wider opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
                    {goalLabels.targetLabel}
                  </Label>
                  <Input
                    id="targetRank"
                    placeholder={goalLabels.placeholder}
                    value={formData.targetRankScore}
                    onChange={(e) => {
                      setFormData({ ...formData, targetRankScore: e.target.value });
                      if (error) setError('');
                      if (mismatchError) setMismatchError(null);
                    }}
                    className={`mt-1.5 rounded-xl font-semibold ${(error && !formData.targetRankScore.trim()) || mismatchError ? 'border-red-500 ring-2 ring-red-500/30' : ''}`}
                    style={{ color: 'var(--theme-text-primary)', borderColor: (error && !formData.targetRankScore.trim()) || mismatchError ? '#ef4444' : 'var(--theme-border)', background: 'var(--theme-background)' }}
                  />
                  <p className="text-[11px] opacity-60 mt-1" style={{ color: 'var(--theme-text-primary)' }}>{goalLabels.targetSubtext}</p>

                  {error && !formData.targetRankScore.trim() && (
                    <p className="text-xs font-bold text-red-400 mt-1 flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {error}
                    </p>
                  )}

                  {/* Goal Category vs Target Input Mismatch Warning Card */}
                  {mismatchError && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 rounded-2xl border-2 bg-red-500/10 border-red-500/50 text-red-300 space-y-3 shadow-lg"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-xl bg-red-500/20 border border-red-500/40 flex items-center justify-center shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-red-400" />
                        </div>
                        <div className="space-y-1">
                          <h5 className="text-xs font-black uppercase tracking-wider text-red-400">Target Mismatch Detected</h5>
                          <p className="text-xs font-extrabold leading-relaxed text-red-200">{mismatchError.message}</p>
                          {mismatchError.reason && (
                            <p className="text-[11px] font-medium opacity-90 text-red-300 pt-0.5">
                              <strong>Why:</strong> {mismatchError.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 pt-2 border-t border-red-500/20">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          type="button"
                          onClick={() => {
                            setMismatchError(null);
                            document.getElementById('targetRank')?.focus();
                          }}
                          className="text-xs font-bold border-red-400/40 text-red-200 hover:bg-red-500/20 rounded-xl"
                        >
                          Edit this field
                        </Button>
                        <Button 
                          size="sm" 
                          type="button"
                          onClick={() => router.push(`/goals?reason=mismatch&fromGoal=${encodeURIComponent(goalId)}`)}
                          className="text-xs font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl shadow-md"
                        >
                          Change my goal category
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            )}

            {/* Step 5: Wellbeing */}
            {step === 5 && (
              <div className="space-y-6">
                <div>
                  <Label className="text-xs font-bold uppercase tracking-wider opacity-80 mb-3 block" style={{ color: 'var(--theme-text-primary)' }}>
                    Current Workload Stress Level *
                  </Label>
                  
                  <div className="grid grid-cols-5 gap-2">
                    {STRESS_LEVELS.map((item) => {
                      const isSelected = formData.stressLevel === item.level;
                      return (
                        <button
                          key={item.level}
                          type="button"
                          onClick={() => setFormData({ ...formData, stressLevel: item.level })}
                          className={`p-3 rounded-2xl flex flex-col items-center justify-center gap-1 transition-all border ${
                            isSelected ? 'scale-105 shadow-lg' : 'hover:scale-102 opacity-70'
                          }`}
                          style={{
                            background: isSelected ? 'var(--theme-surface)' : 'var(--theme-background)',
                            borderColor: isSelected ? item.color : 'var(--theme-border)',
                            color: 'var(--theme-text-primary)',
                          }}
                        >
                          <span className="text-xl">{item.icon}</span>
                          <span className="text-[11px] font-extrabold" style={{ color: isSelected ? item.color : 'var(--theme-text-primary)' }}>
                            Lvl {item.level}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div 
                    className="mt-4 p-4 rounded-2xl border flex items-center justify-between transition-all"
                    style={{ 
                      borderColor: STRESS_LEVELS[formData.stressLevel - 1].color,
                      background: 'var(--theme-surface)',
                    }}
                  >
                    <div>
                      <div className="text-sm font-extrabold flex items-center gap-2" style={{ color: 'var(--theme-text-primary)' }}>
                        <span>{STRESS_LEVELS[formData.stressLevel - 1].icon}</span>
                        <span>{STRESS_LEVELS[formData.stressLevel - 1].label}</span>
                      </div>
                      <p className="text-xs opacity-70 mt-0.5" style={{ color: 'var(--theme-text-primary)' }}>
                        {STRESS_LEVELS[formData.stressLevel - 1].desc}
                      </p>
                    </div>
                    <span 
                      className="text-xs font-black px-3 py-1 rounded-full text-white"
                      style={{ background: STRESS_LEVELS[formData.stressLevel - 1].color }}
                    >
                      {formData.stressLevel} / 5
                    </span>
                  </div>
                </div>

                <div 
                  className="p-4 rounded-2xl border glass-card flex items-start gap-3"
                  style={{ borderColor: 'var(--theme-border)', background: 'var(--theme-surface)' }}
                >
                  <Sparkles className="w-5 h-5 text-[var(--theme-accent)] shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-extrabold text-xs uppercase tracking-wider mb-1" style={{ color: 'var(--theme-text-primary)' }}>
                      Personalized Calibration Ready
                    </h4>
                    <p className="text-xs opacity-75 leading-relaxed" style={{ color: 'var(--theme-text-primary)' }}>
                      We will adapt task difficulty, daily study intensity, and milestone spacing to align strictly with your workload capacity.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Error Alert */}
            {error && (
              <Alert variant="destructive" className="rounded-xl border-red-500/50 bg-red-500/10 text-red-400">
                <AlertDescription className="text-xs font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {error}
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-6">
          <Button
            onClick={handleBack}
            disabled={step === 1 || loading || validatingGoal}
            variant="outline"
            className="px-6 rounded-xl font-bold border"
            style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)', background: 'var(--theme-background-alt)' }}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          {step < totalSteps ? (
            <Button 
              onClick={handleNext} 
              disabled={validatingGoal}
              className="px-8 rounded-xl font-extrabold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
            >
              {validatingGoal ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Validating Goal...
                </>
              ) : (
                <>
                  Next Step
                  <ChevronRight className="w-4 h-4 ml-1" />
                </>
              )}
            </Button>
          ) : (
            <Button 
              onClick={handleSubmit} 
              disabled={loading || Boolean(mismatchError)} 
              className="px-8 rounded-xl font-extrabold text-white shadow-lg"
              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Roadmap...
                </>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Complete & Launch Roadmap
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PersonalizePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
      </div>
    }>
      <PersonalizeContent />
    </Suspense>
  );
}
