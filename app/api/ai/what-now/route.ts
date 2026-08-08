import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { energy_level } = await request.json().catch(() => ({}));

    // Gather real data
    const [goalRes, tasksRes, signalRes] = await Promise.all([
      supabase.from('goals').select('*').eq('user_id', user.id).eq('is_active', true).single(),
      supabase.from('tasks').select('*').eq('user_id', user.id).neq('status', 'completed').order('priority', { ascending: false }).limit(10),
      supabase.from('personalization_signals').select('*').eq('user_id', user.id).eq('date', new Date().toISOString().split('T')[0]).single(),
    ]);

    const goal = goalRes.data;
    const pendingTasks = tasksRes.data || [];
    const todaySignal = signalRes.data;

    // Check cache first (30min TTL)
    const { data: cached } = await supabase
      .from('daily_plans')
      .select('gemini_response_cache, generated_at')
      .eq('user_id', user.id)
      .eq('plan_date', new Date().toISOString().split('T')[0])
      .single();

    // Build prompt
    const urgentTasks = pendingTasks.filter((t: any) => t.priority === 'urgent' || t.priority === 'high').slice(0, 3);
    const energyDesc = energy_level ? `Energy level: ${energy_level}/5` : 'Energy level: not specified';
    
    const prompt = `You are Saathi, an AI study coach. A student just asked "What should I do right now?"

Context:
- Goal: ${goal?.title || 'General studying'}
- Progress: ${goal?.progress || 0}%
- ${energyDesc}
- Study hours today: ${todaySignal?.study_hours || 0}
- Top pending tasks: ${urgentTasks.map((t: any) => `${t.title} (${t.priority})`).join(', ') || 'None'}
- All pending tasks count: ${pendingTasks.length}

Give ONE specific, time-boxed recommendation. Format as JSON:
{
  "action": "Specific action to take right now",
  "duration": "e.g., 45 minutes",
  "topic": "specific topic or task title",
  "estimatedImpact": "~X% readiness increase",
  "reasoning": "one sentence why this is the best next action",
  "motivationalNote": "brief warm encourager"
}

JSON only.`;

    let recommendation: any;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) recommendation = JSON.parse(jsonMatch[0]);
    } catch (e) {
      // Fallback: deterministic recommendation based on data
      recommendation = {
        action: urgentTasks[0]?.title || 'Review your study notes',
        duration: '25 minutes',
        topic: urgentTasks[0]?.title || 'Core concepts',
        estimatedImpact: '~2% readiness increase',
        reasoning: urgentTasks.length > 0 ? 'You have urgent tasks pending' : 'Consistent daily practice is key',
        motivationalNote: 'Small progress beats no progress. Let\'s go! 💪',
      };
    }

    return NextResponse.json({ recommendation, dataUsed: { pendingTaskCount: pendingTasks.length, energyLevel: energy_level, todayHours: todaySignal?.study_hours || 0 } });
  } catch (error) {
    console.error('What-now error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
