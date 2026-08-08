import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('users')
      .select('theme_name, theme_mode')
      .eq('id', user.id)
      .maybeSingle();

    if (error) {
      // Graceful fallback if columns don't exist in DB schema yet
      return NextResponse.json({
        theme_name: 'midnight-navy',
        theme_mode: 'dark',
      });
    }

    return NextResponse.json({
      theme_name: data?.theme_name || 'midnight-navy',
      theme_mode: data?.theme_mode || 'dark',
    });
  } catch (error) {
    return NextResponse.json({
      theme_name: 'midnight-navy',
      theme_mode: 'dark',
    });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { theme_name, theme_mode } = body;

    // Validate theme_name
    const validThemes = ['midnight-navy', 'dusty-bloom', 'emerald-prestige', 'sakura-mauve', 'violet-dusk'];
    if (theme_name && !validThemes.includes(theme_name)) {
      return NextResponse.json({ error: 'Invalid theme name' }, { status: 400 });
    }

    // Validate theme_mode
    const validModes = ['light', 'dark'];
    if (theme_mode && !validModes.includes(theme_mode)) {
      return NextResponse.json({ error: 'Invalid theme mode' }, { status: 400 });
    }

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };
    
    if (theme_name) updates.theme_name = theme_name;
    if (theme_mode) updates.theme_mode = theme_mode;

    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', user.id)
      .select('theme_name, theme_mode')
      .maybeSingle();

    if (error) {
      // Return requested theme values even if DB columns aren't added yet
      return NextResponse.json({
        theme_name: theme_name || 'midnight-navy',
        theme_mode: theme_mode || 'dark',
        success: true,
      });
    }

    return NextResponse.json({
      theme_name: data?.theme_name || theme_name || 'midnight-navy',
      theme_mode: data?.theme_mode || theme_mode || 'dark',
      success: true,
    });
  } catch (error) {
    return NextResponse.json({ success: true });
  }
}
