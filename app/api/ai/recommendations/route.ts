import { createServerClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function GET() {
  try {
    const supabase = await createServerClient();
    
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user's active goal
    const { data: activeGoal } = await supabase
      .from('goals')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single();

    if (!activeGoal) {
      return NextResponse.json({ recommendations: [] });
    }

    // Fetch pending tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id)
      .in('status', ['todo', 'in_progress'])
      .order('priority', { ascending: false })
      .order('due_date', { ascending: true })
      .limit(20);

    // Fetch today's events
    const today = new Date();
    const startOfDay = new Date(today.setHours(0, 0, 0, 0));
    const endOfDay = new Date(today.setHours(23, 59, 59, 999));

    const { data: events } = await supabase
      .from('timetable_events')
      .select('*')
      .eq('user_id', user.id)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString());

    // Calculate free time
    const busyHours = events?.reduce((total, event) => {
      const start = new Date(event.start_time);
      const end = new Date(event.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60 * 60);
    }, 0) || 0;

    const freeHours = Math.max(0, 8 - busyHours); // Assume 8-hour study day

    // Generate AI recommendations
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });

    const prompt = `You are an AI study assistant for an Indian student.

**Student's Goal:** ${activeGoal.title} (${activeGoal.description})
**Goal Progress:** ${activeGoal.progress}%
**Free Time Today:** ${freeHours.toFixed(1)} hours
**Target Date:** ${activeGoal.target_date || 'Not set'}

**Pending Tasks (Top Priority):**
${tasks?.slice(0, 10).map((t, i) => `${i + 1}. [${t.priority.toUpperCase()}] ${t.title} ${t.due_date ? `(Due: ${new Date(t.due_date).toLocaleDateString()})` : ''} - ${t.estimated_hours || 1}h`).join('\n') || 'No tasks'}

**Today's Schedule:**
${events?.map(e => `${new Date(e.start_time).toLocaleTimeString()} - ${e.title}`).join('\n') || 'No events scheduled'}

Generate **3-5 smart, actionable recommendations** for today:
1. Which specific tasks to focus on (consider priority, deadlines, and free time)
2. If they're falling behind, suggest catch-up strategies
3. If they're ahead, suggest optimization or new challenges
4. Mention study patterns or habits to maintain/improve

Rules:
- Be specific (mention task names)
- Be realistic (don't suggest 10 hours of work if they have 2 free hours)
- Be motivating but honest
- Consider Indian student context (competitive exams, placements, etc.)
- Use emojis sparingly (1 per recommendation)

Format as JSON:
{
  "recommendations": [
    { "priority": "high|medium|low", "text": "recommendation text", "taskIds": ["task-id-1", "task-id-2"] },
    ...
  ],
  "summary": "One-line overall status (e.g., 'You're on track!' or 'Catch-up day!')"
}`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse JSON from response
    let recommendations = { recommendations: [], summary: '' };
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/\`\`\`json\n([\s\S]*?)\n\`\`\`/) || responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      }
    } catch (e) {
      // Fallback: convert text to recommendations
      const lines = responseText.split('\n').filter(l => l.trim().length > 0);
      recommendations = {
        recommendations: lines.slice(0, 5).map(text => ({
          priority: 'medium',
          text: text.replace(/^\d+\.\s*/, '').replace(/[*_`]/g, ''),
          taskIds: []
        })),
        summary: 'Recommendations generated'
      };
    }

    return NextResponse.json({
      recommendations: recommendations.recommendations || [],
      summary: recommendations.summary || 'Keep up the good work!',
      freeHours: freeHours.toFixed(1)
    });

  } catch (error) {
    console.error('Error generating recommendations:', error);
    return NextResponse.json({ 
      recommendations: [],
      summary: 'Unable to generate recommendations',
      error: 'Failed to generate recommendations'
    }, { status: 500 });
  }
}
