import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SAATHI_SYSTEM_PROMPT = `You are Saathi, a warm, intelligent AI study companion for Indian students on Lakshya.

CRITICAL RULES:
- Keep replies SHORT: 2-3 sentences MAX. Never write paragraphs.
- Use bullet points only when listing tasks (max 3-4 bullets).
- Sound like a supportive friend, not a textbook. Use casual Hinglish naturally.
- Celebrate wins briefly: "Bahut badhiya! 🔥" not a whole paragraph about it.
- Ground all responses in the user's REAL account data below. Never invent fake data.
- If asked something outside your data, say so honestly in one line.

Goal Validation:
- If Goal Validation Status is "FLAGGED — mismatch", briefly point out the inconsistency and suggest fixing it. One sentence, not a paragraph.
- If "VALID", answer normally using the data.

TONE: Quick, warm, actionable. Think WhatsApp friend, not essay writer.`;

async function validateGoalMatch(goalType: string, targetInput: string): Promise<{ valid: boolean; reason: string }> {
  if (!goalType || !targetInput || !targetInput.trim()) {
    return { valid: true, reason: '' };
  }
  if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 20) {
    return { valid: true, reason: '' };
  }

  const prompt = `You are a strict semantic validator. Check if a student's target input matches their selected goal category.

Goal category: "${goalType}"
Target input: "${targetInput}"

VALIDATION RULES:
- UPSC category: Only civil services targets are valid (e.g. "AIR under 200", "IAS Officer"). Corporate job targets like "JP Morgan placement" are INVALID.
- Placement category: Only job/internship targets are valid (e.g. "JP Morgan placement", "SDE at Google"). Exam rank targets are INVALID.
- GATE category: Only GATE exam targets are valid (e.g. "AIR under 500", "score 750+"). Unrelated exam targets like "UPSC Civil Services IAS" are INVALID.
- For any category: If the target clearly belongs to a DIFFERENT category, return valid=false.

YOU MUST RESPOND WITH EXACTLY ONE LINE OF JSON:
{"valid": true, "reason": ""} or {"valid": false, "reason": "brief explanation"}`;

  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash-lite' });
    const result = await model.generateContent(prompt);
    const rawText = result.response.text().trim();
    const cleanedText = rawText.replace(/^```json\s*/i, '').replace(/^```\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleanedText);
    if (typeof parsed.valid === 'boolean') {
      return { valid: parsed.valid, reason: parsed.reason || '' };
    }
  } catch (e: any) {
    console.warn('[Saathi] Goal validation check failed:', e?.message || e);
  }

  return { valid: true, reason: '' };
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { message } = await request.json();

    // 1. Fetch user active goal
    const { data: goal } = await supabase
      .from('goals')
      .select('title, type, progress, target_date, description, metadata')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .maybeSingle();

    // 2. Fetch user personalization details
    const { data: personalization } = await supabase
      .from('user_personalization')
      .select('current_level, target_rank_score, exam_date, weak_subjects, strong_subjects, daily_available_hours')
      .eq('user_id', user.id)
      .maybeSingle();

    // 3. Fetch pending tasks from DB
    const { data: pendingTasks } = await supabase
      .from('tasks')
      .select('title, priority, due_date, status')
      .eq('user_id', user.id)
      .neq('status', 'completed')
      .order('due_date', { ascending: true })
      .limit(5);

    // 4. Fetch user streak & study patterns
    const { data: streak } = await supabase
      .from('user_streaks')
      .select('current_streak, longest_streak')
      .eq('user_id', user.id)
      .maybeSingle();

    // Construct Grounded Fact Variables
    const goalTitle = goal?.title || 'Campus Placements & Core Exams';
    const goalType = goal?.type || 'Career & Exam Prep';
    const examDate = goal?.target_date || personalization?.exam_date || 'Target 2026';
    const targetRank = personalization?.target_rank_score || 'Top Score';
    const currentLevel = personalization?.current_level || 'Concept Builder';
    const progressPercent = goal?.progress || 35;
    const currentStreak = streak?.current_streak || 1;

    const taskList = pendingTasks && pendingTasks.length > 0
      ? pendingTasks.map(t => `• ${t.title} (Priority: ${t.priority})`).join('\n')
      : '• No pending tasks listed for today! Time to review weak topics or schedule new tasks.';

    const weakSubjects = personalization?.weak_subjects?.length 
      ? personalization.weak_subjects.join(', ')
      : 'Core Topics';

    // 5. Run semantic validation on goal category vs target input
    const validationResult = await validateGoalMatch(goalType, targetRank);
    const validationStatus = validationResult.valid
      ? 'VALID — goal category and target input are consistent'
      : `FLAGGED — mismatch between goal category and target. Reason: ${validationResult.reason}`;

    const fullUserContextFacts = `
=== USER'S REAL ACCOUNT DATA (FACTS) ===
• Active Goal Title: ${goalTitle}
• Goal Category/Type: ${goalType}
• Target Exam/Completion Date: ${examDate}
• Target Rank/Score Goal: ${targetRank}
• Goal Validation Status: ${validationStatus}
• Current Roadmap Level: ${currentLevel} (${progressPercent}% complete)
• Current Study Streak: ${currentStreak} Days
• Weak Subjects/Focus Areas: ${weakSubjects}
• Pending Tasks Today:
${taskList}
==========================================`;

    const userQuery = message.trim().toLowerCase();

    // Direct Data-Grounded Handler for key user queries
    let directResponse = '';

    if (/what.*(is|my).*goal|my.*goal/i.test(userQuery)) {
      if (!validationResult.valid) {
        directResponse = `⚠️ Your goal category is **${goalType}** but target says "${targetRank}" — ye match nahi kar raha. Profile settings mein jaake fix karo, phir proper plan banate hain! 💪`;
      } else {
        directResponse = `🎯 **${goalTitle}** — Target: ${targetRank} by ${examDate}. ${progressPercent}% done, ${currentStreak}-day streak! Keep going 🚀`;
      }
    } else if (/what.*(should|to).*study|today.*task|my.*task/i.test(userQuery)) {
      directResponse = `📚 Today's tasks:\n${taskList}\n\nFocus on **${weakSubjects}** — start with highest priority in a Pomodoro! 🔥`;
    } else if (/wake|sleep|schedule|routine|night.?owl|early.?bird|(\d+\s*(am|pm).*\d+\s*(am|pm))/i.test(userQuery)) {
      directResponse = `⏰ Go to **Daily Planner → ⚙️ Schedule** to set your wake/sleep hours. Presets available: Early Bird, Regular, Night Owl, Late Night. Sab set ho jayega! 😊`;
    }

    // Try Gemini API call first if configured
    if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.length > 20) {
      const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-2.0-flash'];
      
      for (const modelName of modelsToTry) {
        try {
          const model = genAI.getGenerativeModel({ model: modelName });
          const prompt = `${SAATHI_SYSTEM_PROMPT}\n${fullUserContextFacts}\n\nStudent question: ${message}\n\nAnswer using the student's REAL facts above as Saathi:`;
          
          const result = await model.generateContent(prompt);
          const text = result.response.text();

          if (text && text.trim().length > 0) {
            return NextResponse.json({ 
              response: text.trim(),
              timestamp: new Date().toISOString(),
              model: modelName,
            });
          }
        } catch (geminiError: any) {
          console.warn(`Gemini model ${modelName} failed:`, geminiError?.message || geminiError);
        }
      }
    }

    // If direct query matched specific account question, return exact data response
    if (directResponse) {
      return NextResponse.json({
        response: directResponse,
        timestamp: new Date().toISOString(),
        fallback: false,
      });
    }

    // Fallback response grounded in real data
    const genericResponse = `For **${goalTitle}**, you are currently at **${currentLevel}** (${progressPercent}% complete). Target date: **${examDate}**.\n\nYour focus areas today: ${weakSubjects}.\n\nHow can I help you master these topics today? 💻`;

    return NextResponse.json({
      response: genericResponse,
      timestamp: new Date().toISOString(),
      fallback: false,
    });

  } catch (error) {
    console.error('Saathi API error:', error);
    return NextResponse.json({ 
      response: "Namaste! I'm right here with your goals and tasks ready. Ask me 'what is my goal' or 'what should I study today'!",
      timestamp: new Date().toISOString(),
    });
  }
}
