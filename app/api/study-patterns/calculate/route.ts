import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { PersonalizationEngine } from '@/lib/services/personalization-engine';

/**
 * POST /api/study-patterns/calculate
 * 
 * Calculates and updates study patterns for the current user
 * Should be called daily by cron job or on-demand
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { goalId } = body;

    // Calculate study patterns
    const engine = new PersonalizationEngine(supabase, user.id);
    const patterns = await engine.calculateStudyPatterns(goalId);

    if (!patterns) {
      return NextResponse.json(
        { error: 'Failed to calculate study patterns' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patterns,
      message: 'Study patterns calculated successfully',
    });
  } catch (error) {
    console.error('Study patterns calculation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/study-patterns/calculate
 * 
 * Retrieves current study patterns for the user
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    // Check authentication
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const engine = new PersonalizationEngine(supabase, user.id);
    const patterns = await engine.getStudyPatterns();

    if (!patterns) {
      return NextResponse.json(
        { data: null, message: 'No study patterns found' },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      data: patterns,
    });
  } catch (error) {
    console.error('Study patterns fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
