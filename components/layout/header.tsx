'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Target, Menu, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsLoggedIn(!!session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsLoggedIn(!!session);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setIsLoggedIn(false);
    router.push('/');
    router.refresh();
  };

  return (
    <header 
      className="sticky top-0 z-50 w-full border-b backdrop-blur-xl transition-colors"
      style={{ 
        background: 'var(--theme-background-alt)', 
        borderColor: 'var(--theme-border)' 
      }}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div 
              className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-all"
              style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
            >
              <Target className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-extrabold tracking-tight" style={{ color: 'var(--theme-accent)' }}>
              Lakshya
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/#features" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
              Features
            </a>
            <a href="/#how-it-works" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
              How It Works
            </a>
            <a href="/#goals" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
              Goals
            </a>
            <a href="/#pricing" className="font-medium transition-colors hover:opacity-80" style={{ color: 'var(--theme-text-primary)' }}>
              Pricing
            </a>
          </div>

          {/* CTA Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {loading ? (
              <div className="w-32 h-10 bg-white/10 animate-pulse rounded-lg" />
            ) : isLoggedIn ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost" className="font-semibold hover:bg-white/10" style={{ color: 'var(--theme-text-primary)' }}>
                    Dashboard
                  </Button>
                </Link>
                <Button 
                  onClick={handleSignOut}
                  variant="outline" 
                  className="font-bold border-2 rounded-xl"
                  style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
                >
                  Sign Out
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" className="font-semibold hover:bg-white/10" style={{ color: 'var(--theme-text-primary)' }}>
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button 
                    className="font-bold text-white shadow-lg rounded-xl"
                    style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}
                  >
                    Get Started Free
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
            style={{ color: 'var(--theme-text-primary)' }}
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4 border-t border-white/10">
            <a 
              href="/#features" 
              className="block py-2 font-medium transition-colors"
              style={{ color: 'var(--theme-text-primary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Features
            </a>
            <a 
              href="/#how-it-works" 
              className="block py-2 font-medium transition-colors"
              style={{ color: 'var(--theme-text-primary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              How It Works
            </a>
            <a 
              href="/#goals" 
              className="block py-2 font-medium transition-colors"
              style={{ color: 'var(--theme-text-primary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Goals
            </a>
            <a 
              href="/#pricing" 
              className="block py-2 font-medium transition-colors"
              style={{ color: 'var(--theme-text-primary)' }}
              onClick={() => setMobileMenuOpen(false)}
            >
              Pricing
            </a>
            <div className="pt-4 space-y-2">
              {loading ? (
                <div className="w-full h-10 bg-white/10 animate-pulse rounded-lg" />
              ) : isLoggedIn ? (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20" style={{ color: 'var(--theme-text-primary)' }}>
                      Dashboard
                    </Button>
                  </Link>
                  <Button 
                    onClick={() => {
                      handleSignOut();
                      setMobileMenuOpen(false);
                    }}
                    variant="outline"
                    className="w-full border-2"
                    style={{ borderColor: 'var(--theme-accent)', color: 'var(--theme-accent)' }}
                  >
                    Sign Out
                  </Button>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-white/20" style={{ color: 'var(--theme-text-primary)' }}>
                      Sign In
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                    <Button className="w-full font-bold text-white" style={{ background: 'linear-gradient(135deg, var(--theme-primary) 0%, var(--theme-accent) 100%)' }}>
                      Get Started Free
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
