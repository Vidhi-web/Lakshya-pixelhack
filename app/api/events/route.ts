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
    const startDate = searchParams.get('start');
    const endDate = searchParams.get('end');

    // 1. Fetch manual timetable events
    let query = supabase
      .from('timetable_events')
      .select('*')
      .eq('user_id', user.id)
      .order('start_time', { ascending: true });

    if (startDate && endDate) {
      query = query.gte('start_time', startDate).lte('start_time', endDate);
    }

    const { data: rawEvents } = await query;
    const manualEvents = rawEvents || [];

    // 2. Fetch user tasks with due_date
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);

    // Track task_ids already scheduled manually to avoid duplicates
    const scheduledTaskIds = new Set(manualEvents.map(e => e.task_id).filter(Boolean));

    // Map tasks into single-day 1-hour calendar events on their assigned due_date
    const taskEvents: any[] = [];
    
    (tasks || []).forEach(t => {
      if (scheduledTaskIds.has(t.id)) return;
      
      // Only show tasks that have a valid due_date (prevents flooding today with 25+ unscheduled tasks)
      if (!t.due_date) return;

      const start = new Date(t.due_date);
      // Set to 9 AM if no explicit time is specified
      if (!t.due_date.includes('T')) {
        start.setHours(9, 0, 0, 0);
      }
      
      // Fixed 1-hour duration for crisp calendar display (prevents multi-day spanning bars)
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const isCompleted = t.status === 'completed';
      const color = isCompleted 
        ? '#10b981' 
        : t.priority === 'urgent' 
          ? '#ef4444' 
          : t.priority === 'high' 
            ? '#f97316' 
            : '#3b82f6';

      taskEvents.push({
        id: `task-event-${t.id}`,
        user_id: user.id,
        title: `${isCompleted ? '✅' : '📋'} ${t.title}`,
        description: t.description || 'Task from Roadmap',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        color,
        event_type: 'task',
        task_id: t.id,
        goal_id: t.goal_id || null,
      });
    });

    const allEvents = [...manualEvents, ...taskEvents];

    return NextResponse.json({ events: allEvents });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json({ error: 'Failed to fetch events' }, { status: 500 });
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
    const { title, description, start_time, end_time, color, event_type, goal_id, task_id } = body;

    if (!title || !start_time || !end_time) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { data: event, error } = await supabase
      .from('timetable_events')
      .insert({
        user_id: user.id,
        title,
        description: description || null,
        start_time,
        end_time,
        color: color || '#3b82f6',
        event_type: event_type || 'event',
        goal_id: goal_id || null,
        task_id: task_id || null,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ event });
  } catch (error) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: 'Failed to create event' }, { status: 500 });
  }
}
