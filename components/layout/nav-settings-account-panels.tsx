'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Settings, User, Moon, Sun, Bell, Lock, LogOut, 
  Target, GraduationCap, Calendar, Check, Loader2, Sparkles, Shield
} from 'lucide-react';
import { useTheme } from '@/lib/theme-context';
import { ThemeSelector } from '@/components/theme-selector';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

interface NavPanelsProps {
  settingsOpen: boolean;
  accountOpen: boolean;
  onCloseSettings: () => void;
  onCloseAccount: () => void;
}

export function NavSettingsAccountPanels({
  settingsOpen,
  accountOpen,
  onCloseSettings,
  onCloseAccount,
}: NavPanelsProps) {
  const { mode, toggleMode } = useTheme();
  const router = useRouter();
  const supabase = createClient();

  // Settings State
  const [dailyReminders, setDailyReminders] = useState(true);
  const [deadlineAlerts, setDeadlineAlerts] = useState(true);
  const [newPassword, setNewPassword] = useState('');
  const [currentPassword, setCurrentPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordStep, setPasswordStep] = useState<'current' | 'new' | 'reset'>('current');
  const [resetEmailSent, setResetEmailSent] = useState(false);

  // Account State
  const [userInfo, setUserInfo] = useState<{
    name: string;
    email: string;
    level: string;
    goalTitle: string;
    goalType: string;
    examDate: string;
    progress: number;
  }>({
    name: 'Student',
    email: 'user@lakshya.app',
    level: 'Undergraduate',
    goalTitle: 'Campus Placement & Core Exams',
    goalType: 'Career & Exams',
    examDate: '2026-12-31',
    progress: 35,
  });
  const [userLoading, setUserLoading] = useState(true);
  const [signOutLoading, setSignOutLoading] = useState(false);

  useEffect(() => {
    if (accountOpen || settingsOpen) {
      loadUserData();
    }
  }, [accountOpen, settingsOpen]);

  const loadUserData = async () => {
    setUserLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Fetch profile
        const { data: profile } = await supabase
          .from('users')
          .select('name, email')
          .eq('id', user.id)
          .maybeSingle();

        // Fetch personalization for current education level
        const { data: personalization } = await supabase
          .from('user_personalization')
          .select('current_level, exam_date')
          .eq('user_id', user.id)
          .maybeSingle();

        // Fetch active goal
        const { data: goal } = await supabase
          .from('goals')
          .select('title, type, target_date, progress')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle();

        setUserInfo({
          name: profile?.name || user.user_metadata?.name || user.email?.split('@')[0] || 'Learner',
          email: user.email || 'user@lakshya.app',
          level: personalization?.current_level || 'Higher Education / Student',
          goalTitle: goal?.title || 'Personal Execution Goal',
          goalType: goal?.type || 'Career & Exam Prep',
          examDate: goal?.target_date || personalization?.exam_date || 'Target 2026',
          progress: goal?.progress || 25,
        });
      }
    } catch (e) {
      console.warn('User load info warning:', e);
    } finally {
      setUserLoading(false);
    }
  };

  // Test / disposable email detection
  const isTestOrFakeEmail = (email: string): boolean => {
    const testDomains = [
      'test.com', 'example.com', 'mailinator.com', 'guerrillamail.com', 
      'tempmail.com', 'throwaway.email', 'yopmail.com', 'sharklasers.com',
      'grr.la', 'guerrillamailblock.com', 'pokemail.net', 'spam4.me',
      'dispostable.com', 'maildrop.cc', 'fakeinbox.com', 'trashmail.com',
      'temp-mail.org', '10minutemail.com', 'getnada.com', 'mohmal.com',
      'burnermail.io', 'harakirimail.com', 'mailnesia.com',
    ];
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return true;
    if (testDomains.includes(domain)) return true;
    // Check for obvious test patterns
    if (/^test[\d]*@/.test(email.toLowerCase())) return true;
    if (/^fake[\d]*@/.test(email.toLowerCase())) return true;
    return false;
  };

  // Step 1: Verify current password
  const handleVerifyCurrentPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error('Please enter your current password');
      return;
    }
    setPasswordLoading(true);
    try {
      // Get user email
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.email) throw new Error('User email not found');

      // Re-authenticate by signing in with current password
      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (error) {
        toast.error('Current password is incorrect');
        return;
      }

      // Current password verified — advance to new password step
      toast.success('Password verified!');
      setPasswordStep('new');
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Step 2: Set new password
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    setPasswordLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast.success('Password updated successfully!');
      setNewPassword('');
      setCurrentPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
      setPasswordStep('current');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update password');
    } finally {
      setPasswordLoading(false);
    }
  };

  // Forgot password — send reset link
  const handleResetEmail = async () => {
    setPasswordLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email;
      if (!email) {
        toast.error('No email address found for your account');
        return;
      }

      if (isTestOrFakeEmail(email)) {
        toast.error(`Cannot send reset email to "${email}" — this appears to be a test/disposable email address. Please use a real email.`);
        return;
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login`,
      });
      if (error) throw error;
      setResetEmailSent(true);
      toast.success(`Password reset link sent to ${email}`);
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset email');
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSignOut = async () => {
    setSignOutLoading(true);
    try {
      await supabase.auth.signOut();
      toast.success('Signed out successfully');
      onCloseAccount();
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast.error('Error signing out');
    } finally {
      setSignOutLoading(false);
    }
  };

  return (
    <>
      {/* SETTINGS SLIDE-IN PANEL */}
      <AnimatePresence>
        {settingsOpen && (
          <>
            <motion.div
              key="settings-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseSettings}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="settings-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 sm:p-8"
              style={{
                background: 'var(--theme-background)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--theme-neutral-light)' }}>
                      Preferences & Settings
                    </h2>
                    <p className="text-xs opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                      Customize theme, alerts & security
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCloseSettings}
                  className="p-2 rounded-full glass-card hover:bg-white/10 transition"
                  style={{ color: 'var(--theme-neutral-light)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="space-y-8 pt-6">
                {/* 1. Appearance Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                    Visual Theme Selection
                  </h3>

                  <div className="p-4 rounded-2xl glass-card border-white/10 space-y-3">
                    <p className="text-xs opacity-75" style={{ color: 'var(--theme-neutral-light)' }}>
                      Select your favorite curated palette:
                    </p>
                    <ThemeSelector />
                  </div>
                </div>

                {/* 2. Notification Preferences Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                    Notification Preferences
                  </h3>
                  <div className="p-4 rounded-2xl glass-card border-white/10 space-y-4">
                    {/* Daily Reminders Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1 mr-4">
                        <div className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                          Daily Mission Reminders
                        </div>
                        <div className="text-xs opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                          Receive morning task recommendations
                        </div>
                      </div>
                      <button
                        onClick={() => setDailyReminders(!dailyReminders)}
                        className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ 
                          background: dailyReminders 
                            ? 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' 
                            : 'rgba(255, 255, 255, 0.15)' 
                        }}
                        role="switch"
                        aria-checked={dailyReminders}
                      >
                        <span
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-[1px]"
                          style={{ transform: dailyReminders ? 'translateX(20px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>

                    <div className="border-t" style={{ borderColor: 'rgba(255, 255, 255, 0.1)' }} />

                    {/* Deadline Alerts Toggle */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5 flex-1 mr-4">
                        <div className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                          Deadline & Milestone Alerts
                        </div>
                        <div className="text-xs opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                          Get notified when milestone dates approach
                        </div>
                      </div>
                      <button
                        onClick={() => setDeadlineAlerts(!deadlineAlerts)}
                        className="relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none"
                        style={{ 
                          background: deadlineAlerts 
                            ? 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' 
                            : 'rgba(255, 255, 255, 0.15)' 
                        }}
                        role="switch"
                        aria-checked={deadlineAlerts}
                      >
                        <span
                          className="pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out mt-[1px]"
                          style={{ transform: deadlineAlerts ? 'translateX(20px)' : 'translateX(2px)' }}
                        />
                      </button>
                    </div>
                  </div>
                </div>

                {/* 3. Account Security Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                    Account Security
                  </h3>
                  <div className="p-4 rounded-2xl glass-card space-y-3" style={{ borderColor: 'var(--theme-border)' }}>
                    {!showPasswordForm ? (
                      <button
                        onClick={() => { setShowPasswordForm(true); setPasswordStep('current'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setResetEmailSent(false); }}
                        className="w-full flex items-center justify-between p-3 rounded-xl transition-all hover:bg-white/5"
                        style={{ color: 'var(--theme-text-primary)' }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                          >
                            <Shield className="w-5 h-5 text-white" />
                          </div>
                          <div className="text-left">
                            <div className="text-sm font-semibold">Change Password</div>
                            <div className="text-xs opacity-50">Update your account password</div>
                          </div>
                        </div>
                        <svg className="w-4 h-4 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    ) : (
                      <div className="space-y-4">
                        {/* Cancel header */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Lock className="w-4 h-4" style={{ color: 'var(--theme-accent)' }} />
                            <span className="text-xs font-bold uppercase tracking-wider" style={{ color: 'var(--theme-text-primary)' }}>
                              {passwordStep === 'current' && 'Verify Identity'}
                              {passwordStep === 'new' && 'Set New Password'}
                              {passwordStep === 'reset' && 'Reset via Email'}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => { setShowPasswordForm(false); setPasswordStep('current'); setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setResetEmailSent(false); }}
                            className="text-xs opacity-50 hover:opacity-100 transition-opacity"
                            style={{ color: 'var(--theme-text-primary)' }}
                          >
                            Cancel
                          </button>
                        </div>

                        {/* Step 1: Current Password */}
                        {passwordStep === 'current' && (
                          <form onSubmit={handleVerifyCurrentPassword} className="space-y-3">
                            <div className="space-y-1.5">
                              <Label htmlFor="currentPassword" className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                                Current Password
                              </Label>
                              <Input
                                id="currentPassword"
                                type="password"
                                placeholder="Enter your current password"
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                className="rounded-xl bg-white/5"
                                style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={passwordLoading || !currentPassword}
                              className="w-full rounded-xl font-bold text-white shadow-md"
                              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                            >
                              {passwordLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Verifying...</>
                              ) : (
                                'Verify & Continue'
                              )}
                            </Button>
                            <button
                              type="button"
                              onClick={() => setPasswordStep('reset')}
                              className="w-full text-xs text-center py-2 opacity-60 hover:opacity-100 transition-opacity underline"
                              style={{ color: 'var(--theme-accent)' }}
                            >
                              Forgot your password? Reset via email
                            </button>
                          </form>
                        )}

                        {/* Step 2: New Password + Confirm */}
                        {passwordStep === 'new' && (
                          <form onSubmit={handlePasswordChange} className="space-y-3">
                            <div className="text-xs px-3 py-2 rounded-lg bg-green-500/10" style={{ color: 'var(--theme-text-primary)' }}>
                              ✅ Identity verified. Enter your new password below.
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="newPassword" className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                                New Password
                              </Label>
                              <Input
                                id="newPassword"
                                type="password"
                                placeholder="At least 6 characters"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                className="rounded-xl bg-white/5"
                                style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                              />
                            </div>
                            <div className="space-y-1.5">
                              <Label htmlFor="confirmPassword" className="text-xs font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                                Confirm New Password
                              </Label>
                              <Input
                                id="confirmPassword"
                                type="password"
                                placeholder="Re-enter new password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="rounded-xl bg-white/5"
                                style={{ color: 'var(--theme-text-primary)', borderColor: 'var(--theme-border)' }}
                              />
                            </div>
                            <Button
                              type="submit"
                              disabled={passwordLoading || !newPassword || !confirmPassword}
                              className="w-full rounded-xl font-bold text-white shadow-md"
                              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                            >
                              {passwordLoading ? (
                                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Updating...</>
                              ) : (
                                'Update Password'
                              )}
                            </Button>
                          </form>
                        )}

                        {/* Step 3: Forgot — Reset via Email */}
                        {passwordStep === 'reset' && (
                          <div className="space-y-3">
                            {resetEmailSent ? (
                              <div className="text-center space-y-3 py-2">
                                <div className="text-3xl">📧</div>
                                <p className="text-sm font-semibold" style={{ color: 'var(--theme-text-primary)' }}>
                                  Reset link sent!
                                </p>
                                <p className="text-xs opacity-60" style={{ color: 'var(--theme-text-primary)' }}>
                                  Check your inbox and follow the link to reset your password.
                                </p>
                              </div>
                            ) : (
                              <>
                                <p className="text-xs opacity-70" style={{ color: 'var(--theme-text-primary)' }}>
                                  We'll send a password reset link to your registered email address.
                                </p>
                                <Button
                                  onClick={handleResetEmail}
                                  disabled={passwordLoading}
                                  className="w-full rounded-xl font-bold text-white shadow-md"
                                  style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                                >
                                  {passwordLoading ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Sending...</>
                                  ) : (
                                    'Send Reset Link to Email'
                                  )}
                                </Button>
                                <button
                                  type="button"
                                  onClick={() => setPasswordStep('current')}
                                  className="w-full text-xs text-center py-1 opacity-50 hover:opacity-100 transition-opacity"
                                  style={{ color: 'var(--theme-text-primary)' }}
                                >
                                  ← Back to password verification
                                </button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ACCOUNT SLIDE-IN PANEL */}
      <AnimatePresence>
        {accountOpen && (
          <>
            <motion.div
              key="account-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onCloseAccount}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            />

            <motion.div
              key="account-drawer"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 z-50 w-full max-w-lg h-full overflow-y-auto shadow-2xl p-6 sm:p-8"
              style={{
                background: 'var(--theme-background)',
                borderLeft: '1px solid rgba(255, 255, 255, 0.12)',
              }}
            >
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-6 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                    <User className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold" style={{ color: 'var(--theme-neutral-light)' }}>
                      Account & Profile
                    </h2>
                    <p className="text-xs opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                      Your profile information & active goal
                    </p>
                  </div>
                </div>
                <button
                  onClick={onCloseAccount}
                  className="p-2 rounded-full glass-card hover:bg-white/10 transition"
                  style={{ color: 'var(--theme-neutral-light)' }}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="space-y-8 pt-6">
                {/* User Avatar & Name Card */}
                <div className="p-6 rounded-2xl glass-card border-white/10 text-center space-y-3 relative overflow-hidden">
                  <div className="w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl font-extrabold text-white shadow-xl"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                  >
                    {userInfo.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold" style={{ color: 'var(--theme-neutral-light)' }}>
                      {userInfo.name}
                    </h3>
                    <p className="text-sm opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                      {userInfo.email}
                    </p>
                  </div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border"
                    style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)', backgroundColor: 'rgba(249,177,122,0.1)' }}
                  >
                    <GraduationCap className="w-3.5 h-3.5" />
                    <span>{userInfo.level}</span>
                  </div>
                </div>

                {/* Active Goal Summary Card */}
                <div className="space-y-3">
                  <h3 className="text-sm font-semibold uppercase tracking-wider opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                    Active Goal Summary
                  </h3>
                  <div className="p-5 rounded-2xl glass-card border-white/10 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="font-bold text-base" style={{ color: 'var(--theme-neutral-light)' }}>
                            {userInfo.goalTitle}
                          </div>
                          <div className="text-xs opacity-60" style={{ color: 'var(--theme-neutral-light)' }}>
                            Category: {userInfo.goalType}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-white/10" style={{ color: 'var(--theme-neutral-light)' }}>
                      <span className="flex items-center gap-1 opacity-75">
                        <Calendar className="w-3.5 h-3.5 text-amber-400" /> Target Date:
                      </span>
                      <span className="font-semibold text-amber-400">{userInfo.examDate}</span>
                    </div>
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="pt-4">
                  <Button
                    onClick={handleSignOut}
                    disabled={signOutLoading}
                    variant="destructive"
                    className="w-full h-12 rounded-2xl font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform"
                  >
                    {signOutLoading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Signing out...
                      </>
                    ) : (
                      <>
                        <LogOut className="w-5 h-5" />
                        Sign Out of Lakshya
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
