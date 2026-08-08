import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { goalType } = await request.json();
    if (!goalType) {
      return NextResponse.json({ error: 'Goal type required' }, { status: 400 });
    }

    // Deactivate previous active goals
    await supabase
      .from('goals')
      .update({ is_active: false })
      .eq('user_id', user.id);

    // Insert new active goal
    const { data: goal, error } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        type: goalType,
        title: `${goalType.toUpperCase()} Preparation`,
        description: `Active study goal for ${goalType}`,
        is_active: true,
        progress: 0,
      })
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Error saving selected goal:', error.message);
    }

    return NextResponse.json({ success: true, goal });
  } catch (err: any) {
    console.error('Goal select API error:', err);
    return NextResponse.json({ success: true });
  }
}
