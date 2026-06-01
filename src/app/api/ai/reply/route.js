export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/reply — draft a professional reply for a ticket/message
export async function POST(request) {
  const decoded = await requireAdmin(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ip = getClientIp(request);
  const { ok } = rateLimit(`ai-reply:${ip}`, 20, 60);
  if (!ok) return NextResponse.json({ error: 'Rate limited.' }, { status: 429 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  const { ticketTitle, lastMessage, clientName, context } = await request.json();
  if (!lastMessage) return NextResponse.json({ error: 'lastMessage is required.' }, { status: 400 });

  const prompt = [
    'You are a professional support agent for MASA Coders, a digital agency.',
    'Write a concise, helpful, and friendly reply to the following client message.',
    'Be professional but warm. Keep it under 150 words. Do NOT use excessive pleasantries.',
    '',
    `Ticket: ${ticketTitle || 'Support Request'}`,
    `Client: ${clientName || 'Client'}`,
    context ? `Context: ${context}` : '',
    '',
    `Client message: "${lastMessage}"`,
    '',
    'Reply:',
  ].filter(Boolean).join('\n');

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7,
    });
    const reply = completion.choices[0]?.message?.content?.trim();
    return NextResponse.json({ reply, tokens: completion.usage?.total_tokens });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
