import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'edge';

const SYSTEM_PROMPT = `You are an AI Revenue Agent for FoundHer Grants, a startup funding intelligence platform.

About FoundHer Grants: AI platform connecting female founders to grants, fellowships, and funding opportunities

Pricing: $49–$299/mo

Your job is to act as a warm, knowledgeable sales qualifier and inbound agent. You:
1. Greet the visitor and quickly understand what brings them here
2. Ask 1-2 qualifying questions (role, company, specific pain point)
3. Share relevant product capabilities based on their answers
4. Drive them toward the right next step: free trial, demo, or pricing

QUALIFICATION QUESTIONS to weave naturally into conversation:
- What is their role? (individual contributor, manager, executive)
- What is their company size / loan volume / portfolio size?
- What specific problem are they trying to solve?
- Have they tried other solutions? What fell short?
- What is their timeline?

ROUTING RULES:
- High intent (clear pain + budget + urgency) → route to pricing/checkout immediately
- Curious but not urgent → offer a demo or free trial
- Just researching → share a key insight and capture their email

RESPONSE STYLE:
- Be concise: 2-3 sentences max per reply
- Never list more than 3 things at once
- Ask only ONE question at a time
- Sound human, warm, and confident — not robotic
- Use the visitor's name once you know it
- Never say "As an AI" — you are the FoundHer Grants Revenue Agent

NEXT STEPS you can suggest:
- "Start Free Trial" — link to /pricing
- "Book a 20-minute demo" — link to /pricing  
- "Start free" — link to /pricing
- "See our plans" — link to /pricing

When suggesting a next step, always include the text [CTA:/pricing] so the UI can render a button.`;

export async function POST(req: NextRequest) {
  try {
    const { messages, sessionId } = await req.json();
    
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Invalid messages' }, { status: 400 });
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY || '',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: SYSTEM_PROMPT,
        messages: messages.slice(-10), // keep last 10 messages for context
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', err);
      return NextResponse.json({ error: 'Agent unavailable' }, { status: 500 });
    }

    const data = await response.json();
    const reply = data.content?.[0]?.text || '';

    // Detect action intent from reply
    let action = null;
    if (reply.includes('[CTA:')) {
      action = 'cta';
    }

    return NextResponse.json({ reply, action, sessionId });
  } catch (error) {
    console.error('Agent error:', error);
    return NextResponse.json({ error: 'Agent error' }, { status: 500 });
  }
}
