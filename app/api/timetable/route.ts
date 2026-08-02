import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: slots, error } = await supabase
      .from('timetable_slots')
      .select('*')
      .eq('user_id', user.id)
      .order('day', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ slots: slots || [] });
  } catch (error) {
    console.error('Error fetching timetable:', error);
    return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { day, start_time, end_time, subject, type, room, professor, color } = body;

    const { data: slot, error } = await supabase
      .from('timetable_slots')
      .insert({
        user_id: user.id,
        day,
        start_time,
        end_time,
        subject,
        type,
        room,
        professor,
        color,
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ slot }, { status: 201 });
  } catch (error) {
    console.error('Error creating slot:', error);
    return NextResponse.json({ error: 'Failed to create slot' }, { status: 500 });
  }
}
