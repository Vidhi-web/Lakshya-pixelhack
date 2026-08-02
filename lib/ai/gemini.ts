import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export interface Milestone {
  title: string;
  description: string;
  targetDate: string;
  orderIndex: number;
  tasks: Task[];
}

export interface Task {
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedHours: number;
}

export interface Roadmap {
  goalTitle: string;
  goalDescription: string;
  targetDate: string;
  milestones: Milestone[];
}

/**
 * Generate a personalized roadmap using Gemini AI
 * @param goalType - Type of goal (e.g., "GATE", "Placements", "Startup")
 * @param userInput - Additional user context (optional)
 * @returns Structured roadmap with milestones and tasks
 */
export async function generateRoadmap(
  goalType: string,
  userInput?: string
): Promise<Roadmap> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are an expert career advisor and productivity coach specializing in helping Indian students achieve their academic and professional goals. 

Generate a highly detailed, actionable, and personalized roadmap for: "${goalType}"

${userInput ? `Student Context: ${userInput}` : ''}

ROADMAP REQUIREMENTS:

1. GOAL SETUP:
   - Create an inspiring yet realistic goal title
   - Write a motivating 3-4 sentence description explaining the goal's importance and potential outcomes
   - Set a realistic target date (typically 6-12 months from now, adjust based on goal complexity)

2. MILESTONES (Create exactly 5-6 milestones):
   - Each milestone should represent a major phase or achievement
   - Spread milestones evenly across the timeline
   - Progression: Foundation → Learning → Practice → Mastery → Final Prep
   - Each milestone needs a clear, specific title and detailed description

3. TASKS (4-6 tasks per milestone):
   - Make tasks SPECIFIC and ACTIONABLE (not vague)
   - Include concrete deliverables or measurable outcomes
   - Vary task difficulty and time requirements realistically
   - Examples:
     ✓ GOOD: "Complete 50 DSA problems on LeetCode (Easy: 20, Medium: 25, Hard: 5)"
     ✗ BAD: "Practice coding"
   - Priority guidelines:
     * urgent: Critical foundation tasks, exam-related deadlines
     * high: Core learning and skill-building tasks
     * medium: Supplementary learning and practice
     * low: Optional enrichment or exploration
   - Estimated hours should be realistic (range: 2-60 hours per task)

4. CONTEXT-SPECIFIC CONSIDERATIONS:
   For GATE/Competitive Exams:
   - Include syllabus analysis, topic-wise preparation, previous years, mock tests
   
   For Placements/Interviews:
   - Include DSA practice, system design, projects, resume building, mock interviews
   
   For Skill Development:
   - Include course completion, project building, portfolio creation, real-world practice
   
   For Startups:
   - Include market research, MVP development, user testing, iteration cycles
   
   For Higher Studies:
   - Include test prep (GRE/TOEFL), SOP writing, university research, application process

IMPORTANT:
- Use dates in YYYY-MM-DD format ONLY
- Start from today's date and space milestones appropriately
- Be specific with numbers, resources, and outcomes
- Make the roadmap challenging but achievable
- Consider Indian academic calendar and exam schedules

Return ONLY valid JSON (no markdown, no code blocks, no explanatory text):
{
  "goalTitle": "string",
  "goalDescription": "string (3-4 detailed sentences)",
  "targetDate": "YYYY-MM-DD",
  "milestones": [
    {
      "title": "string (specific milestone name)",
      "description": "string (detailed 2-3 sentences explaining this phase)",
      "targetDate": "YYYY-MM-DD",
      "orderIndex": 1,
      "tasks": [
        {
          "title": "string (specific, actionable task)",
          "description": "string (detailed explanation with concrete deliverables)",
          "priority": "low|medium|high|urgent",
          "estimatedHours": number
        }
      ]
    }
  ]
}`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    // Clean up response (remove markdown code blocks if present)
    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    // Parse the JSON response
    const roadmap: Roadmap = JSON.parse(cleanedText);

    // Validate the structure
    if (!roadmap.goalTitle || !roadmap.milestones || roadmap.milestones.length === 0) {
      throw new Error('Invalid roadmap structure returned from AI');
    }

    return roadmap;
  } catch (error: any) {
    console.error('Error generating roadmap with Gemini:', error);
    
    // Fallback roadmap if AI fails
    return createFallbackRoadmap(goalType);
  }
}

/**
 * Create a fallback roadmap if AI generation fails
 */
function createFallbackRoadmap(goalType: string): Roadmap {
  const today = new Date();
  const sixMonthsLater = new Date(today);
  sixMonthsLater.setMonth(sixMonthsLater.getMonth() + 6);

  const milestone1Date = new Date(today);
  milestone1Date.setMonth(milestone1Date.getMonth() + 1);
  
  const milestone2Date = new Date(today);
  milestone2Date.setMonth(milestone2Date.getMonth() + 2);
  
  const milestone3Date = new Date(today);
  milestone3Date.setMonth(milestone3Date.getMonth() + 3);
  
  const milestone4Date = new Date(today);
  milestone4Date.setMonth(milestone4Date.getMonth() + 4);
  
  const milestone5Date = new Date(today);
  milestone5Date.setMonth(milestone5Date.getMonth() + 5);

  return {
    goalTitle: `Master ${goalType}`,
    goalDescription: `A comprehensive journey to achieve excellence in ${goalType}. This roadmap is designed to build strong foundations, develop practical skills, and prepare you thoroughly for success through structured learning and consistent practice.`,
    targetDate: sixMonthsLater.toISOString().split('T')[0],
    milestones: [
      {
        title: 'Foundation & Strategic Planning',
        description: 'Understand the complete scope, analyze requirements, and create a detailed action plan. This phase sets you up for success by ensuring clarity of goals and realistic timeline planning.',
        targetDate: milestone1Date.toISOString().split('T')[0],
        orderIndex: 1,
        tasks: [
          {
            title: 'Complete syllabus and requirement analysis',
            description: 'Research and document all topics, skills, and knowledge areas required. Create a comprehensive checklist of everything you need to cover.',
            priority: 'urgent',
            estimatedHours: 8,
          },
          {
            title: 'Design personalized weekly study schedule',
            description: 'Create a realistic timetable allocating specific time slots for different subjects/skills. Include breaks and buffer time for unexpected delays.',
            priority: 'high',
            estimatedHours: 4,
          },
          {
            title: 'Gather and organize learning resources',
            description: 'Collect recommended books, online courses, practice platforms, and materials. Create bookmarks and organize them by topic for easy access.',
            priority: 'high',
            estimatedHours: 5,
          },
          {
            title: 'Set up progress tracking system',
            description: 'Create spreadsheets or use apps to track daily progress, completed tasks, and time spent on each topic.',
            priority: 'medium',
            estimatedHours: 2,
          },
          {
            title: 'Join relevant communities and study groups',
            description: 'Find online forums, Discord servers, or local groups where you can ask questions, share progress, and stay motivated.',
            priority: 'low',
            estimatedHours: 3,
          },
        ],
      },
      {
        title: 'Core Concepts & Fundamentals',
        description: 'Build a rock-solid foundation by mastering fundamental concepts thoroughly. Focus on deep understanding rather than surface-level knowledge to ensure long-term retention.',
        targetDate: milestone2Date.toISOString().split('T')[0],
        orderIndex: 2,
        tasks: [
          {
            title: 'Study and understand all basic concepts',
            description: 'Go through each fundamental topic systematically. Take detailed notes, create concept maps, and ensure you can explain each concept in simple terms.',
            priority: 'urgent',
            estimatedHours: 60,
          },
          {
            title: 'Solve 100+ foundational practice problems',
            description: 'Work through basic to intermediate problems to reinforce understanding. Focus on quality over quantity - understand every solution thoroughly.',
            priority: 'high',
            estimatedHours: 40,
          },
          {
            title: 'Create personal reference notes and cheat sheets',
            description: 'Summarize key concepts, formulas, and patterns in your own words. These will be invaluable for quick revision later.',
            priority: 'high',
            estimatedHours: 12,
          },
          {
            title: 'Complete self-assessment test on fundamentals',
            description: 'Take a comprehensive test covering all basic topics to identify weak areas that need more attention.',
            priority: 'medium',
            estimatedHours: 4,
          },
        ],
      },
      {
        title: 'Intermediate Mastery & Skill Building',
        description: 'Level up your knowledge by tackling intermediate topics and developing problem-solving skills. Start building projects or solving real-world challenges.',
        targetDate: milestone3Date.toISOString().split('T')[0],
        orderIndex: 3,
        tasks: [
          {
            title: 'Master all intermediate-level topics',
            description: 'Study advanced concepts that build upon fundamentals. Focus on connecting different topics and understanding their relationships.',
            priority: 'urgent',
            estimatedHours: 70,
          },
          {
            title: 'Build 3 practical projects or solve case studies',
            description: 'Apply your knowledge to real-world scenarios. Document your approach, challenges faced, and solutions implemented.',
            priority: 'high',
            estimatedHours: 45,
          },
          {
            title: 'Solve 200+ intermediate practice problems',
            description: 'Work through problems of varying difficulty. Time yourself to build speed while maintaining accuracy.',
            priority: 'high',
            estimatedHours: 50,
          },
          {
            title: 'Participate in online competitions or challenges',
            description: 'Test your skills in competitive environments. Analyze your performance and learn from top performers.',
            priority: 'medium',
            estimatedHours: 15,
          },
        ],
      },
      {
        title: 'Advanced Topics & Real-World Application',
        description: 'Explore advanced concepts and edge cases. Develop expertise by working on complex problems and understanding advanced patterns.',
        targetDate: milestone4Date.toISOString().split('T')[0],
        orderIndex: 4,
        tasks: [
          {
            title: 'Study all advanced topics and patterns',
            description: 'Deep dive into complex concepts. Study expert-level resources and research papers if applicable.',
            priority: 'high',
            estimatedHours: 50,
          },
          {
            title: 'Solve previous year questions or past papers',
            description: 'Complete last 5 years of actual exam questions or real interview problems. Analyze patterns and frequently asked topics.',
            priority: 'urgent',
            estimatedHours: 40,
          },
          {
            title: 'Complete advanced project or contribute to open source',
            description: 'Work on a challenging project that showcases your skills. Make it portfolio-worthy with proper documentation.',
            priority: 'medium',
            estimatedHours: 35,
          },
          {
            title: 'Teach or explain concepts to others',
            description: 'Join study groups or create content explaining difficult topics. Teaching is the best way to solidify understanding.',
            priority: 'low',
            estimatedHours: 10,
          },
        ],
      },
      {
        title: 'Intensive Practice & Mock Tests',
        description: 'Build exam temperament and test-taking skills through intensive practice. Identify and eliminate weak areas through targeted revision.',
        targetDate: milestone5Date.toISOString().split('T')[0],
        orderIndex: 5,
        tasks: [
          {
            title: 'Take 15+ full-length mock tests',
            description: 'Simulate actual exam conditions. Analyze each mock test thoroughly to identify patterns in mistakes and time management issues.',
            priority: 'urgent',
            estimatedHours: 35,
          },
          {
            title: 'Intensive weak area revision',
            description: 'Focus heavily on topics where you consistently make mistakes. Solve additional problems until these become strengths.',
            priority: 'urgent',
            estimatedHours: 30,
          },
          {
            title: 'Speed optimization practice',
            description: 'Work on solving familiar problems faster without compromising accuracy. Practice mental calculations and shortcut techniques.',
            priority: 'high',
            estimatedHours: 20,
          },
          {
            title: 'Peer mock interviews or group study sessions',
            description: 'Practice explaining your approach and solutions to others. Get feedback on communication and problem-solving style.',
            priority: 'medium',
            estimatedHours: 12,
          },
        ],
      },
      {
        title: 'Final Preparation & Confidence Building',
        description: 'Last-mile preparation focusing on revision, maintaining peak performance, and building confidence. Fine-tune your strategy and mental preparation.',
        targetDate: sixMonthsLater.toISOString().split('T')[0],
        orderIndex: 6,
        tasks: [
          {
            title: 'Complete comprehensive revision of all topics',
            description: 'Quick but thorough review of notes, cheat sheets, and key concepts. Focus on high-yield topics and frequently asked areas.',
            priority: 'urgent',
            estimatedHours: 40,
          },
          {
            title: 'Solve final mock test series (5-10 tests)',
            description: 'Take the most realistic and difficult mocks available. Treat each one as the actual exam.',
            priority: 'urgent',
            estimatedHours: 20,
          },
          {
            title: 'Mental preparation and stress management',
            description: 'Practice meditation, maintain healthy sleep schedule, and develop positive visualization techniques. Prepare mentally for exam day.',
            priority: 'high',
            estimatedHours: 8,
          },
          {
            title: 'Review common mistakes and create final checklist',
            description: 'Compile all recurring mistakes and create a quick checklist to review before the exam. Include time management strategies.',
            priority: 'medium',
            estimatedHours: 5,
          },
          {
            title: 'Logistics and exam day preparation',
            description: 'Verify exam center location, required documents, permitted items. Plan travel and create buffer time for unforeseen issues.',
            priority: 'medium',
            estimatedHours: 3,
          },
        ],
      },
    ],
  };
}

/**
 * Generate weekly AI recommendations based on user progress
 * @param userId - User ID
 * @param progressData - User's progress data
 * @returns Personalized recommendations
 */
export async function generateWeeklyRecommendations(
  userId: string,
  progressData: {
    completedTasks: number;
    totalTasks: number;
    goalProgress: number;
    recentActivity: string[];
  }
): Promise<string[]> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `You are a productivity coach for Indian students. Analyze the following progress data and provide 3-5 specific, actionable recommendations for the upcoming week.

Progress Data:
- Completed Tasks: ${progressData.completedTasks}/${progressData.totalTasks}
- Overall Progress: ${progressData.goalProgress}%
- Recent Activity: ${progressData.recentActivity.join(', ')}

Provide recommendations that:
1. Are specific and actionable
2. Address any gaps or concerns
3. Motivate and encourage
4. Are realistic for Indian students
5. Focus on next steps

Return ONLY a JSON array of strings (no markdown):
["recommendation 1", "recommendation 2", "recommendation 3"]`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();

    let cleanedText = text.trim();
    if (cleanedText.startsWith('```json')) {
      cleanedText = cleanedText.replace(/^```json\n/, '').replace(/\n```$/, '');
    } else if (cleanedText.startsWith('```')) {
      cleanedText = cleanedText.replace(/^```\n/, '').replace(/\n```$/, '');
    }

    const recommendations: string[] = JSON.parse(cleanedText);
    return recommendations;
  } catch (error) {
    console.error('Error generating recommendations:', error);
    
    // Fallback recommendations
    return [
      'Focus on completing high-priority tasks this week',
      'Dedicate 2 hours daily for focused study',
      'Review and revise completed topics regularly',
    ];
  }
}
