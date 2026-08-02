// Generate sample data for Lakshya
// Run with: node scripts/seed-database.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Use service role key to bypass RLS
);

// Different goal types to create variety
const goalTypes = [
  { type: 'GATE_2027', title: 'GATE Preparation 2027', desc: 'Comprehensive GATE CS exam preparation' },
  { type: 'PLACEMENTS_2027', title: 'Campus Placements 2027', desc: 'Software engineering placement prep' },
  { type: 'STARTUP_LAUNCH', title: 'Launch EdTech Startup', desc: 'Build and launch educational platform MVP' },
  { type: 'HIGHER_STUDIES', title: 'MS in Computer Science', desc: 'Prepare for higher studies abroad (GRE, TOEFL, SOP)' },
  { type: 'SKILL_DEVELOPMENT', title: 'Master Full Stack Development', desc: 'Master React, Next.js, Node.js, and databases' },
  { type: 'CAT_2027', title: 'CAT MBA Preparation', desc: 'Prepare for CAT MBA entrance' },
  { type: 'CERTIFICATION', title: 'AWS Solutions Architect', desc: 'Get AWS Solutions Architect certification' },
  { type: 'FREELANCING', title: 'Freelancing Career', desc: 'Build portfolio and get first 5 clients' },
  { type: 'RESEARCH', title: 'ML Research Publication', desc: 'Publish machine learning research paper' },
  { type: 'COMPETITIVE', title: 'Competitive Programming Expert', desc: 'Reach Codeforces Expert (1600+ rating)' },
];

const milestoneTemplates = [
  { title: 'Foundation', desc: 'Build strong foundation', days: 30 },
  { title: 'Core Learning', desc: 'Master core concepts', days: 60 },
  { title: 'Practice', desc: 'Extensive practice and projects', days: 90 },
  { title: 'Final Polish', desc: 'Mock tests and refinement', days: 120 },
];

const taskTemplates = [
  { title: 'Complete syllabus analysis', priority: 'high', hours: 5 },
  { title: 'Study fundamentals', priority: 'urgent', hours: 20 },
  { title: 'Practice problems daily', priority: 'high', hours: 15 },
  { title: 'Build project', priority: 'medium', hours: 30 },
  { title: 'Take mock test', priority: 'medium', hours: 3 },
  { title: 'Review and revise', priority: 'low', hours: 10 },
  { title: 'Join study group', priority: 'low', hours: 2 },
  { title: 'Watch tutorials', priority: 'medium', hours: 8 },
];

function getRandomDate(daysFromNow) {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date.toISOString().split('T')[0];
}

function getRandomStatus() {
  const statuses = ['completed', 'in_progress', 'todo'];
  return statuses[Math.floor(Math.random() * statuses.length)];
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // 1. Get all existing users from the database
    console.log('👥 Fetching existing users...');
    const { data: existingUsers, error: fetchError } = await supabase
      .from('users')
      .select('id, email, name');

    if (fetchError) {
      console.error('Error fetching users:', fetchError);
      return;
    }

    if (!existingUsers || existingUsers.length === 0) {
      console.error('❌ No users found! Please sign up at least one user first.');
      console.log('💡 Go to http://localhost:3000/signup and create an account.\n');
      return;
    }

    console.log(`✅ Found ${existingUsers.length} user(s)\n`);

    // 2. Create multiple goals for each user (2-3 goals per user)
    console.log('🎯 Creating diverse goals for users...');
    const goals = [];
    
    existingUsers.forEach((user, userIdx) => {
      // Each user gets 2-3 random goals
      const numGoals = 2 + Math.floor(Math.random() * 2); // 2 or 3 goals
      const shuffled = [...goalTypes].sort(() => 0.5 - Math.random());
      
      for (let i = 0; i < numGoals; i++) {
        const goalTemplate = shuffled[i];
        goals.push({
          user_id: user.id,
          type: goalTemplate.type,
          title: goalTemplate.title,
          description: goalTemplate.desc,
          target_date: getRandomDate(60 + i * 30), // Spread target dates
          is_active: i === 0, // Only first goal is active
          progress: Math.floor(Math.random() * 60) + 10, // 10-70%
        });
      }
    });

    const { data: insertedGoals, error: goalsError } = await supabase
      .from('goals')
      .insert(goals)
      .select();

    if (goalsError) {
      console.error('Error inserting goals:', goalsError);
      return;
    }
    console.log(`✅ Created ${insertedGoals.length} goals\n`);

    // 3. Insert Milestones (4 per goal)
    console.log('🏁 Inserting milestones...');
    const milestones = [];
    insertedGoals.forEach((goal) => {
      milestoneTemplates.forEach((template, idx) => {
        milestones.push({
          goal_id: goal.id,
          title: template.title,
          description: template.desc,
          target_date: getRandomDate(template.days),
          status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'not_started',
          order_index: idx + 1,
        });
      });
    });

    const { data: insertedMilestones, error: milestonesError } = await supabase
      .from('milestones')
      .insert(milestones)
      .select();

    if (milestonesError) {
      console.error('Error inserting milestones:', milestonesError);
      return;
    }
    console.log(`✅ Inserted ${insertedMilestones.length} milestones\n`);

    // 4. Insert Tasks (6-10 per goal)
    console.log('✅ Inserting tasks...');
    const tasks = [];
    insertedGoals.forEach((goal) => {
      const goalMilestones = insertedMilestones.filter(m => m.goal_id === goal.id);
      const numTasks = Math.floor(Math.random() * 5) + 6; // 6-10 tasks

      for (let i = 0; i < numTasks; i++) {
        const template = taskTemplates[i % taskTemplates.length];
        const milestone = goalMilestones[Math.floor(Math.random() * goalMilestones.length)];
        const status = getRandomStatus();

        tasks.push({
          user_id: goal.user_id,
          goal_id: goal.id,
          milestone_id: milestone.id,
          title: `${template.title} - ${goal.title.split(' ')[0]}`,
          description: `Task for ${goal.title}`,
          status: status,
          priority: template.priority,
          estimated_hours: template.hours,
          due_date: getRandomDate(Math.floor(Math.random() * 60)),
          completed_at: status === 'completed' ? new Date().toISOString() : null,
        });
      }
    });

    const { data: insertedTasks, error: tasksError } = await supabase
      .from('tasks')
      .insert(tasks)
      .select();

    if (tasksError) {
      console.error('Error inserting tasks:', tasksError);
      return;
    }
    console.log(`✅ Inserted ${insertedTasks.length} tasks\n`);

    // 5. Insert Analytics Events
    console.log('📊 Inserting analytics events...');
    const analyticsEvents = [];
    insertedGoals.forEach((goal) => {
      // Goal created event
      analyticsEvents.push({
        user_id: goal.user_id,
        goal_id: goal.id,
        event_type: 'goal_created',
        metadata: { goalType: goal.type },
        timestamp: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      });

      // Some task completion events
      for (let i = 0; i < 3; i++) {
        analyticsEvents.push({
          user_id: goal.user_id,
          goal_id: goal.id,
          event_type: 'task_completed',
          metadata: { taskTitle: 'Sample task' },
          timestamp: new Date(Date.now() - Math.random() * 20 * 24 * 60 * 60 * 1000).toISOString(),
        });
      }
    });

    const { error: analyticsError } = await supabase
      .from('analytics_events')
      .insert(analyticsEvents);

    if (analyticsError) {
      console.error('Error inserting analytics:', analyticsError);
      return;
    }
    console.log(`✅ Inserted ${analyticsEvents.length} analytics events\n`);

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📊 Summary:');
    console.log(`   - ${existingUsers.length} users`);
    console.log(`   - ${insertedGoals.length} goals`);
    console.log(`   - ${insertedMilestones.length} milestones`);
    console.log(`   - ${insertedTasks.length} tasks`);
    console.log(`   - ${analyticsEvents.length} analytics events`);
    console.log('\n💡 Your analytics page will now show real aggregated data from all goals and tasks!\n');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
  }
}

// Run the seeding
seedDatabase();
