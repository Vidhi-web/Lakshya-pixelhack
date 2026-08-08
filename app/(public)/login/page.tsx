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
import { Target, Loader2, AlertCircle, Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) {
        if (loginError.message.includes('Invalid login credentials')) {
          setError('Invalid email or password. Please try again.');
        } else if (loginError.message.includes('Email not confirmed')) {
          setError('Please confirm your email before logging in.');
        } else {
          setError(loginError.message);
        }
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from('users')
          .upsert({
            id: data.user.id,
            email: data.user.email!,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'id',
            ignoreDuplicates: false,
          });

        if (profileError) console.error('Profile error:', profileError);
      }

      router.push('/dashboard');
      router.refresh();
    } catch (error: any) {
      console.error('Login error:', error);
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
          className="absolute -top-20 -left-20 w-96 h-96 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--theme-primary)' }}
          animate={{ scale: [1, 1.2, 1], x: [0, 30, 0] }} 
          transition={{ duration: 8, repeat: Infinity }} 
        />
        <motion.div 
          className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full blur-3xl opacity-20"
          style={{ background: 'var(--theme-accent)' }}
          animate={{ scale: [1, 1.3, 1], y: [0, -40, 0] }} 
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
                <span>Lakshya • लक्ष्य</span>
              </div>
              
              <CardTitle 
                className="text-3xl font-extrabold tracking-tight"
                style={{ color: 'var(--theme-neutral-light)' }}
              >
                Welcome Back
              </CardTitle>
              <CardDescription 
                className="mt-1 text-sm opacity-75"
                style={{ color: 'var(--theme-neutral-light)' }}
              >
                Sign in to continue your goal execution journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="space-y-5">
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
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-sm font-semibold" style={{ color: 'var(--theme-neutral-light)' }}>
                    Password
                  </Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={loading}
                  className="h-11 rounded-xl transition-all border-white/10 focus:border-amber-400 bg-white/5 text-white placeholder:text-white/40"
                />
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
                    Signing in...
                  </>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    Sign In to Lakshya <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>

              <div className="pt-2 text-center text-sm" style={{ color: 'var(--theme-neutral-light)', opacity: 0.8 }}>
                Don't have an account?{' '}
                <Link 
                  href="/signup" 
                  className="font-bold hover:underline"
                  style={{ color: 'var(--theme-accent)' }}
                >
                  Create free account
                </Link>
              </div>
            </form>

            <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-2 text-xs opacity-50" style={{ color: 'var(--theme-neutral-light)' }}>
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Secure encrypted access • Lakshya Goal Engine</span>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
