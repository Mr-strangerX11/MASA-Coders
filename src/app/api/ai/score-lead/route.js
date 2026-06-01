export const dynamic = 'force-dynamic';
import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';
import { rateLimit } from '@/lib/rateLimit';
import { getClientIp } from '@/lib/apiHelpers';
import connectDB from '@/lib/mongodb';
import Lead from '@/models/Lead';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// POST /api/ai/score-lead — score a lead 1-10 and update the record
export async function POST(request) {
  const decoded = await requireAdmin(request);
  if (!decoded) return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 });

  const ip = getClientIp(request);
  const { ok } = rateLimit(`ai-score:${ip}`, 20, 60);
  if (!ok) return NextResponse.json({ error: 'Rate limited.' }, { status: 429 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ error: 'OpenAI API key not configured.' }, { status: 503 });
  }

  const { leadId } = await request.json();
  if (!leadId) return NextResponse.json({ error: 'leadId required.' }, { status: 400 });

  await connectDB();
  const lead = await Lead.findById(leadId);
  if (!lead) return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });

  const prompt = `You are a sales qualification expert. Score the following lead from 1-10 (10 = highest value).
Consider: budget specificity, project clarity, urgency, company size, and message quality.

Lead details:
- Name: ${lead.contact_name}
- Company: ${lead.company_name || 'Not provided'}
- Service interest: ${lead.service || 'Not specified'}
- Budget: ${lead.budget || 'Not specified'}
- Message: "${lead.message || 'No message'}"

Respond with ONLY a JSON object: {"score": <1-10>, "reason": "<one sentence>"}`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 80,
      temperature: 0.3,
    });

    const raw  = completion.choices[0]?.message?.content?.trim();
    const json = JSON.parse(raw.replace(/```json?|```/g, '').trim());
    const score  = Math.min(10, Math.max(1, parseInt(json.score)));
    const reason = json.reason || '';

    // Save score and reason into lead notes
    lead.notes = `[AI Score: ${score}/10] ${reason}\n${lead.notes || ''}`.trim();
    await lead.save();

    return NextResponse.json({ score, reason, leadId });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
