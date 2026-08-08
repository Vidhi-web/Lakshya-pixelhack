import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { computePace, redistributeMissedTasks, buildRecalcPrompt } from '@/lib/ai/adaptive-roadmap';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Get active goal
    const { data: goal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!goal) return NextResponse.json({ error: 'No active goal' }, { status: 404 });

    // Compute pace
    const paceAnalysis = await computePace(user.id, goal.id);

    // Get missed tasks
    const { data: allTasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_id', goal.id);

    const now = new Date();
    const missedTasks = (allTasks || []).filter(t => {
      if (!t.due_date || t.status === 'completed') return false;
      return new Date(t.due_date) < now;
    });

    // Save snapshot to roadmap_versions before modifying
    const { data: lastVersion } = await supabase
      .from('roadmap_versions')
      .select('version_number')
      .eq('goal_id', goal.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .single();

    const nextVersion = (lastVersion?.version_number || 0) + 1;

    await supabase.from('roadmap_versions').insert({
      user_id: user.id,
      goal_id: goal.id,
      version_number: nextVersion,
      trigger_reason: missedTasks.length > 0 ? 'missed_tasks' : paceAnalysis.pace === 'ahead' ? 'ahead_of_schedule' : 'scheduled',
      snapshot: { tasks: allTasks, paceAnalysis },
    });

    // Get AI suggestions (with fallback if Gemini fails)
    let aiSuggestion: any = null;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const prompt = buildRecalcPrompt(goal, paceAnalysis, missedTasks);
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) aiSuggestion = JSON.parse(jsonMatch[0]);
    } catch (e) {
      console.error('Gemini recalc failed, using deterministic fallback:', e);
    }

    // Redistribute missed tasks (deterministic)
    const redistributions = redistributeMissedTasks(missedTasks, paceAnalysis.daysRemaining);
    
    // Apply redistributions
    const updatePromises = redistributions.map(({ taskId, newDueDate }) =>
      supabase.from('tasks').update({ due_date: newDueDate }).eq('id', taskId).eq('user_id', user.id)
    );
    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      paceAnalysis,
      redistributedCount: redistributions.length,
      aiSuggestion,
      version: nextVersion,
      message: missedTasks.length > 0
        ? `Welcome back! I've adjusted your roadmap and rescheduled ${redistributions.length} tasks.`
        : paceAnalysis.pace === 'ahead' ? 'Outstanding! You\'re ahead of schedule. Keep climbing!'
        : 'Your roadmap is on track. One step closer!',
    });
  } catch (error) {
    console.error('Recalculate error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    
    const paceAnalysis = await computePace(user.id, '');
    return NextResponse.json({ paceAnalysis });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
