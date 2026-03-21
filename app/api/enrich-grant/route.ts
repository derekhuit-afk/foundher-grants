import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'
export const maxDuration = 120

export async function POST(req: Request) {
  const { grantId, secret } = await req.json()
  const CRON_SECRET = process.env.CRON_SECRET || 'foundher_cron_2025_secure'
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY

  // Allow either cron secret or authenticated admin
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Auth check — either secret or logged-in admin
  if (secret !== CRON_SECRET) {
    const authHeader = req.headers.get('authorization')
    if (!authHeader) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    const userClient = createClient(supabaseUrl, anonKey)
    const { data: { user } } = await userClient.auth.getUser(authHeader.replace('Bearer ', ''))
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const admins = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
    if (!admins.includes(user.email || '')) return NextResponse.json({ error: 'Admin only' }, { status: 403 })
  }

  if (!ANTHROPIC_KEY) return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })

  // Fetch the grant
  const { data: grant, error: fetchErr } = await supabase.from('grants').select('*').eq('id', grantId).single()
  if (fetchErr || !grant) return NextResponse.json({ error: 'Grant not found' }, { status: 404 })

  // Call Claude to enrich the grant
  const prompt = `You are a grant research specialist. Research the following grant and provide comprehensive, accurate information.

GRANT: ${grant.name}
ORGANIZATION: ${grant.grantor_organization}
TYPE: ${grant.grantor_type}
CURRENT DESCRIPTION: ${grant.description}
PURPOSE: ${grant.grant_purpose || 'Not specified'}
SOURCE URL: ${grant.source_url || 'Not provided'}
AMOUNT: ${grant.amount_display || '$' + (grant.min_amount || 0) + ' - $' + (grant.max_amount || 0)}
ELIGIBILITY TAGS: ${(grant.eligible_for || []).join(', ')}

Respond ONLY with a valid JSON object (no markdown, no backticks, no explanation) with these exact keys:

{
  "full_description": "3-5 paragraph detailed description of the grant program: its history, mission, what it funds, who has been awarded in the past, and why it matters for women-owned and Indigenous-owned businesses. Be specific and factual.",
  "eligibility_details": "Detailed eligibility requirements in paragraph form: business type, ownership percentages, revenue thresholds, geographic restrictions, certification requirements, industry focus, years in operation, and any disqualifying factors.",
  "required_documents": ["List", "of", "specific", "documents", "typically", "required"],
  "application_process": "Step-by-step description of how to apply: where to find the application, submission method (online portal, email, mail), review timeline, notification process, and any pre-application steps like letters of inquiry.",
  "form_url": "The actual URL where the application form can be found, or null if unknown",
  "has_external_form": true or false - whether this grant has its own external application form/portal,
  "form_fields": [
    {
      "id": "field_1",
      "label": "Question or field label",
      "type": "text|textarea|select|checkbox|number|date|email|phone|file",
      "required": true or false,
      "placeholder": "Helper text",
      "options": ["only", "for", "select", "type"],
      "section": "Section name like 'Organization Information' or 'Project Narrative'",
      "help_text": "Additional guidance for this field"
    }
  ]
}

For form_fields: If the grant has a known application form, replicate its actual fields as closely as possible. If not, create a comprehensive application form that would be appropriate for this specific grant, organized into logical sections. A typical grant application should have 15-30 fields covering:
- Organization/Business Information (name, EIN, address, founding date, ownership structure)
- Contact Information (primary contact, phone, email)
- Business Profile (industry, revenue, employees, certifications held)
- Project/Funding Request (amount requested, project title, project summary)
- Project Narrative (need statement, objectives, methodology, timeline, expected outcomes)
- Budget (total project cost, amount requested, other funding sources)
- Impact Statement (communities served, jobs created, measurable outcomes)
- Certifications & Compliance (relevant certifications, any required attestations)
- Supporting Documents (list of attachments needed)

Make form fields specific to this grant's focus area and requirements. Every field must have a unique id.`

  try {
    const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }],
      }),
    })

    if (!claudeRes.ok) {
      const errBody = await claudeRes.text()
      return NextResponse.json({ error: 'Claude API error', detail: errBody }, { status: 502 })
    }

    const claudeData = await claudeRes.json()
    const text = claudeData.content?.[0]?.text || ''

    // Parse the JSON response — handle potential markdown wrapping
    let enrichment: any
    try {
      const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim()
      enrichment = JSON.parse(cleaned)
    } catch (parseErr) {
      return NextResponse.json({ error: 'Failed to parse Claude response', raw: text.substring(0, 500) }, { status: 500 })
    }

    // Update the grant in Supabase
    const { error: updateErr } = await supabase.from('grants').update({
      full_description: enrichment.full_description,
      eligibility_details: enrichment.eligibility_details,
      required_documents: enrichment.required_documents || [],
      application_process: enrichment.application_process,
      form_url: enrichment.form_url || null,
      has_external_form: enrichment.has_external_form || false,
      form_fields: enrichment.form_fields || [],
      enriched: true,
      updated_at: new Date().toISOString(),
    }).eq('id', grantId)

    if (updateErr) {
      return NextResponse.json({ error: 'Failed to update grant', detail: updateErr.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      grantId,
      name: grant.name,
      fieldsGenerated: enrichment.form_fields?.length || 0,
      hasExternalForm: enrichment.has_external_form || false,
    })
  } catch (err: any) {
    return NextResponse.json({ error: 'Enrichment failed', detail: err.message }, { status: 500 })
  }
}

// Batch enrichment endpoint — enrich multiple grants
export async function GET(req: Request) {
  const url = new URL(req.url)
  const secret = url.searchParams.get('secret')
  const limit = parseInt(url.searchParams.get('limit') || '5')
  const CRON_SECRET = process.env.CRON_SECRET || 'foundher_cron_2025_secure'

  if (secret !== CRON_SECRET) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const supabase = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false } })

  // Get unenriched grants, prioritizing featured ones
  const { data: grants } = await supabase
    .from('grants')
    .select('id, name')
    .eq('enriched', false)
    .eq('is_active', true)
    .order('featured', { ascending: false })
    .order('max_amount', { ascending: false })
    .limit(limit)

  if (!grants || grants.length === 0) {
    return NextResponse.json({ message: 'All grants are enriched', remaining: 0 })
  }

  const results: any[] = []
  for (const grant of grants) {
    try {
      // Call ourselves for each grant
      const enrichRes = await fetch(`${url.origin}/api/enrich-grant`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grantId: grant.id, secret: CRON_SECRET }),
      })
      const result = await enrichRes.json()
      results.push({ id: grant.id, name: grant.name, ...result })
    } catch (err: any) {
      results.push({ id: grant.id, name: grant.name, error: err.message })
    }
  }

  // Count remaining
  const { count } = await supabase.from('grants').select('id', { count: 'exact', head: true }).eq('enriched', false)

  return NextResponse.json({ enriched: results.length, remaining: count, results })
}
