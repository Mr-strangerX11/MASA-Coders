export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/task-ai — generate task description + subtasks from a title
export async function POST(request) {
  const decoded = await requireAdmin(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ip = getClientIp(request);
  const { ok } = rateLimit(`ai-task:${ip}`, 20, 60);
  if (!ok) return NextResponse.json({ error: 'Rate limited.' }, { status: 429 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  const { title, projectContext } = await request.json();
  if (!title?.trim()) return NextResponse.json({ error: 'title is required.' }, { status: 400 });

  const prompt = `You are a project management expert for a digital agency.
Given the task title below, generate a brief description (2 sentences) and 3-5 actionable subtasks.

Task title: "${title}"
${projectContext ? `Project context: ${projectContext}` : ''}

Respond ONLY with JSON: {"description": "...", "subtasks": ["...", "...", "..."]}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 300,
      temperature: 0.6,
    });

    const raw  = completion.choices[0]?.message?.content?.trim();
    const json = JSON.parse(raw.replace(/```json?|```/g, '').trim());

    return NextResponse.json({
      description: json.description || '',
      subtasks:    (json.subtasks || []).slice(0, 5),
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
