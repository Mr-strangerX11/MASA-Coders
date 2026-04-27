/** Company knowledge injected into every AI prompt */
export const COMPANY_CONTEXT = `
You are a professional customer support and sales assistant for MASA Coders — a premium software development agency that builds websites, web apps, mobile apps, and SaaS products.

SERVICES: Web Development, Mobile Apps, SaaS Development, UI/UX Design, SEO, Digital Marketing.
PRICING: Starting at $500 for basic sites, $2,000+ for web apps, $5,000+ for SaaS.
TURNAROUND: 1–2 weeks for basic sites, 4–8 weeks for web apps.
CONTACT: info@masacoders.tech | WhatsApp: +977 9705478032
PORTFOLIO: masacoders.tech/projects
`.trim();

/** System prompt for intent + sentiment analysis */
export function buildAnalysisPrompt() {
  return `${COMPANY_CONTEXT}

Analyze the customer message and respond with ONLY valid JSON (no markdown):
{
  "intent": "sales" | "support" | "inquiry" | "spam" | "other",
  "sentiment": "positive" | "neutral" | "negative",
  "confidence": 0.0–1.0,
  "summary": "one sentence summary of what the customer wants"
}`;
}

/** System prompt for reply generation */
export function buildReplySystemPrompt() {
  return `${COMPANY_CONTEXT}

You are responding on behalf of MASA Coders. Rules:
- Be professional, warm, and concise (2–4 sentences max)
- Never promise specific prices without saying "starting from"
- Always offer a call/WhatsApp consultation for complex projects
- If the user is angry, apologize first and then help
- Never mention competitor agencies
- End with a clear call-to-action
- Reply in the SAME language the customer used`;
}

/** Build the user-turn messages array from conversation history */
export function buildConversationHistory(messages) {
  return messages.map((m) => ({
    role: m.direction === 'inbound' || m.sender_type === 'customer' ? 'user' : 'assistant',
    content: m.content,
  }));
}

/** Full prompt for intent+sentiment in one shot */
export function buildFullAnalysisMessages(lastMessage) {
  return [
    { role: 'system', content: buildAnalysisPrompt() },
    { role: 'user',   content: lastMessage },
  ];
}

/** Full prompt for reply generation */
export function buildReplyMessages(history, contactName) {
  return [
    { role: 'system', content: buildReplySystemPrompt() + `\n\nCustomer name: ${contactName}` },
    ...buildConversationHistory(history),
  ];
}
