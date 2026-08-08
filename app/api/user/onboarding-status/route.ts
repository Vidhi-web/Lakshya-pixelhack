import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ authenticated: false, isComplete: false, nextStep: '/login' }, { status: 401 });
    }

    // 1. Check personalization
    const { data: personalization } = await supabase
      .from('user_personalization')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    // 2. Check any user goal
    const { data: goal } = await supabase
      .from('goals')
      .select('id')
      .eq('user_id', user.id)
      .limit(1)
      .maybeSingle();

    // If either personalization OR goal exists, workspace is UNLOCKED!
    if (personalization || goal) {
      return NextResponse.json({ 
        authenticated: true, 
        hasGoal: true, 
        hasPersonalization: true, 
        isComplete: true, 
        nextStep: null 
      });
    }

    // Only if user has zero goals and zero personalization records, send to /goals
    return NextResponse.json({ 
      authenticated: true, 
      hasGoal: false, 
      hasPersonalization: false, 
      isComplete: false, 
      nextStep: '/goals' 
    });
  } catch (error) {
    console.error('Onboarding status check error:', error);
    // On error, default to unlocked workspace so user is never trapped
    return NextResponse.json({ authenticated: true, isComplete: true, nextStep: null });
  }
}
