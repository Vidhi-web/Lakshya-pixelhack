'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Target, Loader2, AlertCircle, Sparkles, Rocket, ShieldCheck } from 'lucide-react';

export default function SignupPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    try {
      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      });

      if (signupError) {
        if (signupError.message.includes('rate limit') || signupError.message.includes('Email rate')) {
          setError('Too many signup attempts. Please wait a few minutes and try again, or use a different email.');
        } else if (signupError.message.includes('already registered')) {
          setError('This email is already registered. Try logging in instead.');
        } else {
          setError(signupError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email!,
            name: name || null,
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        if (data.session) {
          router.push('/dashboard');
          router.refresh();
        } else {
          setError('Please check your email to confirm your account, then log in.');
          setTimeout(() => {
            router.push('/login');
          }, 3000);
        }
      }
    } catch (error: any) {
      console.error('Signup error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center relative overflow-hidden p-4 sm:p-6"
      style={{ background: 'var(--theme-background)' }}
    >
      {/* Background Mesh Glow Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <motion.div 
          className="absolute -top-20 -right-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--theme-primary)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, -30, 0] }} 
          transition={{ duration: 8, repeat: Infinity }} 
        />
        <motion.div 
          className="absolute -bottom-20 -left-20 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--theme-accent)' }}
          animate={{ scale: [1, 1.3, 1], y: [0, 40, 0] }} 
          transition={{ duration: 10, repeat: Infinity, delay: 2 }} 
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <Card 
          className="glass-card shadow-2xl border-2 backdrop-blur-xl"
          style={{ borderColor: 'rgba(249,177,122,0.25)' }}
        >
          <CardHeader className="space-y-4 text-center pb-6">
            <div className="flex justify-center">
              <Link href="/" className="group flex items-center gap-2">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-105"
                  style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                >
                  <Target className="h-7 w-7 text-white" />
                </div>
              </Link>
            </div>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-3 border"
                style={{ 
                  borderColor: 'var(--theme-accent)', 
                  color: 'var(--theme-accent)',
                  backgroundColor: 'rgba(249,177,122,0.1)' 
                }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Start Your Journey • लक्ष्य</span>
              </div>
              
              <CardTitle 
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: 'var(--theme-neutral-light)' }}
              >
                Create Account
              </CardTitle>
              <CardDescription 
                className="mt-1 text-sm opacity-75"
                style={{ color: 'var(--theme-neutral-light)' }}
              >
                Join thousands using AI guidance to crack their goals
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignup} className="space-y-5">
              {error && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-4 text-sm rounded-xl border flex items-start gap-2.5 bg-red-500/10 border-red-500/30 text-red-300"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="name" className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                  Full Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={loading}
                  className="h-11 rounded-xl transition-all border-white/10 focus:border-amber-400 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 rounded-xl transition-all border-white/10 focus:border-amber-400 bg-white/5 text-white placeholder:text-white/40"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                  className="h-11 rounded-xl transition-all border-white/10 focus:border-amber-400 bg-white/5 text-white placeholder:text-white/40"
                />
                <p className="text-xs opacity-50" style={{ color: 'var(--theme-neutral-light)' }}>
                  Must be at least 6 characters
                </p>
              </div>

              <Button 
                type="submit" 
                size="lg"
                className="w-full h-12 text-base font-bold rounded-xl shadow-lg transition-transform hover:scale-[1.02] active:scale-[0.98] text-white" 
                style={{ 
                  background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' 
                }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Get Started Now <Rocket className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="pt-2 text-center text-sm" style={{ color: 'var(--theme-neutral-light)', opacity: 0.8 }}>
                Already have an account?{' '}
                <Link 
                  href="/login" 
                  className="font-bold hover:underline"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  Sign in instead
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs opacity-50" style={{ color: 'var(--theme-neutral-light)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>100% Free • Privacy Protected • Lakshya Goal Engine</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
