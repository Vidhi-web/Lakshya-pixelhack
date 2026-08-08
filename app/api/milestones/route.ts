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
      .select('id, type')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .limit(1)
      .maybeSingle();

    if (!activeGoal) {
      return NextResponse.json({ milestones: [], goalType: null });
    }

    // Fetch milestones for the active goal
    const { data: milestones, error } = await supabase
      .from('milestones')
      .select('*')
      .eq('goal_id', activeGoal.id)
      .order('order_index', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ 
      milestones: milestones || [],
      goalType: activeGoal.type || null,
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json({ error: 'Failed to fetch milestones' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    const { data, error } = await supabase
      .from('milestones')
      .update({ status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ milestone: data });
  } catch (error) {
    console.error('Error updating milestone:', error);
    return NextResponse.json({ error: 'Failed to update milestone' }, { status: 500 });
  }
}
