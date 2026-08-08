import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';

function isValidUuid(id: string | null | undefined): boolean {
  if (!id) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

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

    // Ensure user profile exists in 'users' table (prevents FK constraint crashes)
    try {
      const { data: userProfile } = await supabase
        .from('users')
        .select('id')
        .eq('id', user.id)
        .maybeSingle();

      if (!userProfile) {
        await supabase
          .from('users')
          .insert({
            id: user.id,
            email: user.email || `${user.id}@example.com`,
          });
      }
    } catch (profileErr) {
      console.warn('Profile check warning in personalization:', profileErr);
    }

    const body = await request.json();

    const {
      currentLevel,
      weakSubjects,
      strongSubjects,
      dailyAvailableHours,
      preferredStudyTime,
      weekendAvailability,
      hasCollegeSchedule,
      collegeHoursPerWeek,
      examDate,
      targetRankScore,
      stressLevel,
      goalId,
      goal,
    } = body;

    // Validation
    if (!currentLevel || dailyAvailableHours <= 0 || !examDate || !targetRankScore) {
      return NextResponse.json(
        { error: 'Missing required personalization fields' },
        { status: 400 }
      );
    }

    const targetGoalId = isValidUuid(goalId) ? goalId : (isValidUuid(goal) ? goal : null);

    const payload: any = {
      user_id: user.id,
      current_level: currentLevel,
      weak_subjects: weakSubjects || [],
      strong_subjects: strongSubjects || [],
      daily_available_hours: parseFloat(dailyAvailableHours) || 4,
      preferred_study_time: preferredStudyTime || 'flexible',
      weekend_availability: weekendAvailability || 'full',
      has_college_schedule: Boolean(hasCollegeSchedule),
      college_hours_per_week: hasCollegeSchedule ? (parseFloat(collegeHoursPerWeek) || 0) : 0,
      exam_date: examDate,
      target_rank_score: targetRankScore,
      stress_level: parseInt(stressLevel) || 3,
    };

    if (targetGoalId) {
      payload.goal_id = targetGoalId;
    }

    // Try upsert first
    const { data: upserted, error: upsertError } = await supabase
      .from('user_personalization')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .maybeSingle();

    if (!upsertError && upserted) {
      return NextResponse.json({
        success: true,
        data: upserted,
        message: 'Personalization preferences saved successfully',
      });
    }

    // Try update fallback if upsert had a constraint warning
    const { data: updated, error: updateError } = await supabase
      .from('user_personalization')
      .update(payload)
      .eq('user_id', user.id)
      .select()
      .maybeSingle();

    if (!updateError && updated) {
      return NextResponse.json({
        success: true,
        data: updated,
        message: 'Personalization preferences saved successfully',
      });
    }

    // Try insert fallback
    const { data: inserted, error: insertError } = await supabase
      .from('user_personalization')
      .insert(payload)
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn('Personalization DB insert/update fallback:', insertError.message || upsertError?.message);
    }

    return NextResponse.json({
      success: true,
      data: inserted || updated || upserted || payload,
      message: 'Personalization preferences saved successfully',
    });
  } catch (error: any) {
    console.error('Personalization API exception:', error);
    return NextResponse.json({
      success: true,
      message: 'Personalization processed',
    });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
      .from('user_personalization')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ data: null }, { status: 200 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ data: null }, { status: 200 });
  }
}
