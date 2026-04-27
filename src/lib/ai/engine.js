import OpenAI from 'openai';
import { buildFullAnalysisMessages, buildReplyMessages } from './prompts.js';

// Compatible with OpenAI AND Groq (same SDK interface)
const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY || process.env.OPENAI_API_KEY,
  baseURL: process.env.GROQ_API_KEY
    ? 'https://api.groq.com/openai/v1'
    : undefined,
});

const MODEL = process.env.AI_MODEL || (process.env.GROQ_API_KEY ? 'llama3-70b-8192' : 'gpt-4o-mini');

/**
 * Analyse a single message for intent + sentiment.
 */
export async function analyseMessage(text) {
  try {
    const response = await client.chat.completions.create({
      model:       MODEL,
      messages:    buildFullAnalysisMessages(text),
      temperature: 0.1,
      max_tokens:  200,
      response_format: process.env.GROQ_API_KEY ? undefined : { type: 'json_object' },
    });

    const raw  = response.choices[0].message.content.trim();
    const json = JSON.parse(raw.replace(/```json|```/g, '').trim());
    return {
      intent:    json.intent    || 'inquiry',
      sentiment: json.sentiment || 'neutral',
      confidence: parseFloat(json.confidence) || 0.7,
      summary:   json.summary   || '',
    };
  } catch (err) {
    console.error('[AI] analyseMessage error:', err.message);
    return { intent: 'inquiry', sentiment: 'neutral', confidence: 0.5, summary: '' };
  }
}

/**
 * Generate a context-aware reply suggestion.
 * @param {{ messages: object[], contactName: string }} opts
 */
export async function generateSuggestion({ messages, contactName }) {
  const lastMsg = messages.at(-1)?.content || '';

  // Run analysis + reply in parallel
  const [analysis, replyRes] = await Promise.all([
    analyseMessage(lastMsg),
    client.chat.completions.create({
      model:       MODEL,
      messages:    buildReplyMessages(messages, contactName),
      temperature: 0.6,
      max_tokens:  300,
    }),
  ]);

  const reply     = replyRes.choices[0].message.content.trim();
  const tokensUsed = replyRes.usage?.total_tokens || 0;

  return {
    reply,
    intent:     analysis.intent,
    sentiment:  analysis.sentiment,
    confidence: analysis.confidence,
    tokensUsed,
  };
}

/**
 * Quick single-shot reply (for the API endpoint, no queue).
 */
export async function quickReply(messages, contactName) {
  const response = await client.chat.completions.create({
    model:       MODEL,
    messages:    buildReplyMessages(messages, contactName),
    temperature: 0.6,
    max_tokens:  300,
  });
  return response.choices[0].message.content.trim();
}
