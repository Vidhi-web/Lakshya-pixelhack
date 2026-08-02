import { NextResponse } from 'next/server';
import { generateRoadmap } from '@/lib/ai/gemini';
import { createServerClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  try {
    const { goalType, userInput } = await request.json();

    if (!goalType) {
      return NextResponse.json(
        { error: 'Goal type is required' },
        { status: 400 }
      );
    }

    // Initialize Supabase client
    const supabase = await createServerClient();

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Ensure user profile exists
    const { data: userProfile, error: profileCheckError } = await supabase
      .from('users')
      .select('id')
      .eq('id', user.id)
      .single();

    if (profileCheckError || !userProfile) {
      // Create user profile if it doesn't exist
      const { error: createProfileError } = await supabase
        .from('users')
        .insert({
          id: user.id,
          email: user.email!,
        });

      if (createProfileError) {
        console.error('Error creating user profile:', createProfileError);
        return NextResponse.json(
          { error: 'Failed to create user profile' },
          { status: 500 }
        );
      }
    }

    // Generate roadmap using Gemini AI
    console.log('Generating roadmap for:', goalType);
    const roadmap = await generateRoadmap(goalType, userInput);

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
      .single();

    if (goalError) {
      console.error('Error saving goal:', goalError);
      return NextResponse.json(
        { error: 'Failed to save goal' },
        { status: 500 }
      );
    }

    console.log('Goal saved:', goal.id);

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

    if (milestonesError) {
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
    });

    const { error: tasksError } = await supabase
      .from('tasks')
      .insert(tasksData);

    if (tasksError) {
      console.error('Error saving tasks:', tasksError);
      return NextResponse.json(
        { error: 'Failed to save tasks' },
        { status: 500 }
      );
    }

    console.log('Tasks saved:', tasksData.length);

    // Log analytics event
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
