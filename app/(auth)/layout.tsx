import { redirect } from 'next/navigation';
import { createServerClient } from '@/lib/supabase/server';
import { Header } from '@/components/layout/header';
import { Sidebar } from '@/components/layout/sidebar';
import { SaathiChatbot } from '@/components/saathi/chatbot';
import { OnboardingGuard } from '@/components/auth/onboarding-guard';

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createServerClient();

  // Check authentication
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  return (
    <OnboardingGuard>
      <div className="min-h-screen flex flex-col" style={{ background: 'var(--theme-background)' }}>
        <Header />
        <div className="flex flex-1 relative">
          <Sidebar />
          <main className="flex-1 w-full min-h-screen">
            {children}
          </main>
        </div>
        <SaathiChatbot />
      </div>
    </OnboardingGuard>
  );
}
