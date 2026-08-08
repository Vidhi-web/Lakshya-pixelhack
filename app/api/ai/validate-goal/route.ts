import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export const dynamic = 'force-dynamic';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { goalType, targetInput } = await request.json();

    if (!goalType || !targetInput || !targetInput.trim()) {
      return NextResponse.json({ valid: true, reason: '' });
    }

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.length < 20) {
      return NextResponse.json({ valid: true, reason: '' });
    }

    const prompt = `You are a strict semantic validator. Your ONLY job is to check if a student's target input matches their selected goal category.

Goal category: "${goalType}"
Target input: "${targetInput}"

VALIDATION RULES:
- UPSC category: Only civil services targets are valid (e.g. "AIR under 200", "IAS Officer", "clear prelims"). Corporate job targets like "JP Morgan placement" are INVALID.
- Placement category: Only job/internship targets are valid (e.g. "JP Morgan placement", "SDE at Google", "product company offer"). Exam rank targets like "AIR under 200" are INVALID.
- GATE category: Only GATE exam targets are valid (e.g. "AIR under 500", "score 750+", "IIT admission"). Unrelated exam targets like "UPSC Civil Services IAS" are INVALID.
- JEE category: Only JEE exam targets are valid. Corporate placement targets are INVALID.
- CAT category: Only MBA/CAT targets are valid. Engineering exam targets are INVALID.
- For any category: If the target clearly belongs to a DIFFERENT category, return valid=false.

YOU MUST RESPOND WITH EXACTLY ONE LINE OF JSON, NO OTHER TEXT:
{"valid": true, "reason": ""} if target matches the category
{"valid": false, "reason": "brief explanation"} if target does NOT match the category`;

    const modelsToTry = ['gemini-3.5-flash-lite', 'gemini-2.0-flash'];

    for (const modelName of modelsToTry) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent(prompt);
        const rawText = result.response.text().trim();

        // Strip markdown code fences if present
        const cleanedText = rawText
          .replace(/^```json\s*/i, '')
          .replace(/^```\s*/i, '')
          .replace(/\s*```$/i, '')
          .trim();

        const parsed = JSON.parse(cleanedText);

        if (typeof parsed.valid === 'boolean') {
          return NextResponse.json({
            valid: parsed.valid,
            reason: parsed.reason || '',
          });
        }
      } catch (e: any) {
        console.warn(`[validate-goal] Model ${modelName} error:`, e?.message || e);
      }
    }

    // If all models fail, allow through (don't block the user)
    return NextResponse.json({ valid: true, reason: '' });

  } catch (error) {
    console.error('[validate-goal] Error:', error);
    return NextResponse.json({ valid: true, reason: '' });
  }
}
