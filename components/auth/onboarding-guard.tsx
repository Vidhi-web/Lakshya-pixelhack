'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const EXEMPT_PATHS = ['/goals', '/personalize'];

export function OnboardingGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [checking, setChecking] = useState(true);
  const [status, setStatus] = useState<{ isComplete: boolean; nextStep: string | null } | null>(null);

  useEffect(() => {
    let isMounted = true;

    // Fast local session check
    if (typeof window !== 'undefined' && sessionStorage.getItem('lakshya_onboarding_complete') === 'true') {
      setStatus({ isComplete: true, nextStep: null });
      setChecking(false);
    }

    async function checkStatus() {
      const isExempt = EXEMPT_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

      try {
        const res = await fetch('/api/user/onboarding-status');
        if (res.ok) {
          const data = await res.json();
          if (!isMounted) return;

          if (data.authenticated === false) {
            router.push('/login');
            return;
          }

          if (data.isComplete) {
            if (typeof window !== 'undefined') {
              sessionStorage.setItem('lakshya_onboarding_complete', 'true');
            }
          }

          setStatus({ isComplete: data.isComplete, nextStep: data.nextStep });

          if (!data.isComplete && !isExempt) {
            toast.error('Please complete all setup steps first to unlock the platform!', { id: 'onboarding-lock' });
            router.replace(data.nextStep || '/goals');
            return;
          }
        }
      } catch (err) {
        console.error('Onboarding guard check error:', err);
      } finally {
        if (isMounted) setChecking(false);
      }
    }

    checkStatus();

    return () => {
      isMounted = false;
    };
  }, [pathname, router]);

  const isExempt = EXEMPT_PATHS.some(p => pathname === p || pathname.startsWith(p + '/'));

  // Block rendering locked pages while verifying or if incomplete
  if (!isExempt && (checking || (status && !status.isComplete))) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ background: 'var(--theme-background)', color: 'var(--theme-text-primary)' }}>
        <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-accent)]" />
        <p className="text-xs font-bold opacity-60">Unlocking your workspace...</p>
      </div>
    );
  }

  return <>{children}</>;
}
