import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's active goal
    const { data: activeGoal } = await supabase
      .from('goals')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!activeGoal) {
      return NextResponse.json({ milestones: [] });
    }

    // Fetch milestones for the active goal
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', activeGoal.id)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ milestones: milestones || [] });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}
