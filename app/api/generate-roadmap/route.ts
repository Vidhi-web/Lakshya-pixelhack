import { NextResponse } from 'next/server';
import { generateRoadmap } from '@/lib/ai/gemini';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty body is OK
    }

    let goalType = body.goalType;
    const userInput = body.userInput;

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Please log in to generate your AI roadmap.' },
        { status: 401 }
      );
    }

    // If goalType not provided in body, fetch active or latest goal from DB
    if (!goalType) {
      const { data: activeGoal } = await supabase
        .from('goals')
        .select('type')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (activeGoal?.type) {
        goalType = activeGoal.type;
      } else {
        // Fallback: check any goal for user
        const { data: anyGoal } = await supabase
          .from('goals')
          .select('type')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (anyGoal?.type) {
          goalType = anyGoal.type;
        } else {
          // Fallback: check personalization
          const { data: personalization } = await supabase
            .from('user_personalization')
            .select('goal_id')
            .eq('user_id', user.id)
            .maybeSingle();

          goalType = personalization?.goal_id || 'placement';
        }
      }
    }

    // Server-Side Safety Validation: Check if goalType and userInput match semantically
    if (userInput && userInput.trim() && process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20) {
      const validationPrompt = `Goal category: ${goalType}\nTarget input: "${userInput}"\nDoes the target input make sense for this goal category? Reply with strict JSON only:\n{"valid": true, "reason": ""} OR {"valid": false, "reason": "one short sentence explanation"}`;
      
      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
        const valResult = await model.generateContent(validationPrompt);
        const rawText = valResult.response.text().trim();
        const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
        const parsedVal = JSON.parse(cleanedText);
        if (parsedVal.valid === false) {
          return NextResponse.json(
            { 
              error: `Target "${userInput}" does not match goal category ${goalType.toUpperCase()}`,
              reason: parsedVal.reason || 'Mismatched target input'
            },
            { status: 400 }
          );
        }
      } catch (valErr) {
        console.warn('Server-side goal validation warning:', valErr);
      }
    }

    // Ensure user profile exists
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
      console.warn('User profile check warning:', profileErr);
    }

    // Generate roadmap using Gemini AI (or fallback)
    console.log('Generating roadmap for goalType:', goalType);
    const roadmap = await generateRoadmap(goalType, userInput);

    // Deactivate old goals for this user
    try {
      await supabase
        .from('goals')
        .update({ is_active: false })
        .eq('user_id', user.id);
    } catch (e) {
      console.warn('Deactivate old goals warning:', e);
    }

    // Save goal to database
    const { data: goal, error: goalError } = await supabase
      .from('goals')
      .insert({
        user_id: user.id,
        type: goalType,
        title: roadmap.goalTitle,
        description: roadmap.goalDescription,
        target_date: roadmap.targetDate,
        is_active: true,
        progress: 0,
        metadata: {
          userInput: userInput || null,
        },
      })
      .select()
      .maybeSingle();

    if (goalError || !goal) {
      console.error('Error saving goal:', goalError);
      return NextResponse.json(
        { error: 'Failed to save goal to database' },
        { status: 500 }
      );
    }

    console.log('Goal saved successfully:', goal.id);

    // Save milestones
    const milestonesData = roadmap.milestones.map((milestone) => ({
      goal_id: goal.id,
      title: milestone.title,
      description: milestone.description,
      target_date: milestone.targetDate,
      status: 'not_started' as const,
      order_index: milestone.orderIndex,
    }));

    const { data: milestones, error: milestonesError } = await supabase
      .from('milestones')
      .insert(milestonesData)
      .select();

    if (milestonesError || !milestones) {
      console.error('Error saving milestones:', milestonesError);
      return NextResponse.json(
        { error: 'Failed to save milestones' },
        { status: 500 }
      );
    }

    console.log('Milestones saved:', milestones.length);

    // Save tasks
    const tasksData: any[] = [];
    roadmap.milestones.forEach((milestone, milestoneIndex) => {
      const correspondingMilestone = milestones[milestoneIndex];
      if (correspondingMilestone) {
        milestone.tasks.forEach((task) => {
          tasksData.push({
            user_id: user.id,
            goal_id: goal.id,
            milestone_id: correspondingMilestone.id,
            title: task.title,
            description: task.description,
            status: 'todo',
            priority: task.priority,
            estimated_hours: task.estimatedHours,
          });
        });
      }
    });

    if (tasksData.length > 0) {
      const { error: tasksError } = await supabase
        .from('tasks')
        .insert(tasksData);

      if (tasksError) {
        console.warn('Error saving tasks warning:', tasksError.message);
      }
    }

    // Log analytics event
    try {
      await supabase.from('analytics_events').insert({
        user_id: user.id,
        goal_id: goal.id,
        event_type: 'goal_created',
        metadata: {
          goalType,
          milestonesCount: milestones.length,
          tasksCount: tasksData.length,
        },
      });
    } catch (e) {
      console.warn('Analytics event log warning:', e);
    }

    return NextResponse.json({
      success: true,
      goal: {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        targetDate: goal.target_date,
      },
      milestonesCount: milestones.length,
      tasksCount: tasksData.length,
    });
  } catch (error: any) {
    console.error('Error in generate-roadmap API:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
