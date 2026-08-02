import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date'); // Format: YYYY-MM-DD

    // Get pomodoro sessions (they're stored as timetable_events with event_type='pomodoro')
    let query = supabase
      .from('timetable_events')
      .select('*')
      .eq('user_id', user.id)
      .eq('event_type', 'pomodoro')
      .order('start_time', { ascending: false });

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      query = query
        .gte('start_time', startOfDay.toISOString())
        .lte('start_time', endOfDay.toISOString());
    }

    const { data: sessions, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Calculate stats
    const totalSessions = sessions?.length || 0;
    const totalMinutes = sessions?.reduce((acc, session) => {
      const start = new Date(session.start_time);
      const end = new Date(session.end_time);
      return acc + (end.getTime() - start.getTime()) / (1000 * 60);
    }, 0) || 0;

    return NextResponse.json({ 
      sessions,
      stats: {
        totalSessions,
        totalMinutes: Math.round(totalMinutes),
        totalHours: Math.round(totalMinutes / 60 * 10) / 10,
      }
    });
  } catch (error) {
    console.error('Error fetching pomodoro sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { title, start_time, end_time, goal_id, task_id, description } = body;

    if (!start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: session, error } = await supabase
      .from('timetable_events')
      .insert({
        user_id: user.id,
        title: title || 'Pomodoro Session',
        description: description || null,
        start_time,
        end_time,
        event_type: 'pomodoro',
        color: '#ef4444',
        goal_id: goal_id || null,
        task_id: task_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Log analytics
    await supabase
      .from('analytics_events')
      .insert({
        user_id: user.id,
        goal_id: goal_id || null,
        event_type: 'pomodoro_completed',
        metadata: {
          duration_minutes: (new Date(end_time).getTime() - new Date(start_time).getTime()) / (1000 * 60),
          task_id,
        },
        timestamp: end_time,
      });

    return NextResponse.json({ session });
  } catch (error) {
    console.error('Error creating pomodoro session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
