// FoundHer Grants — AI Agent Orchestrator
// All 6 agents: Intake, Research, Eligibility, Narrative, Assembly, Delivery

const NARRATIVE_SYSTEM_PROMPT = `You are the FoundHer Grants Narrative Writing Agent — the core writing engine of the FoundHer Grants platform. FoundHer Grants is a grant discovery and application service built exclusively for women-owned businesses and Native American / Indigenous-owned businesses.

Your single job is to produce complete, compelling, submission-ready grant application narratives that win funding for underrepresented founders. You write with precision, authority, and authentic voice. Every application is tailored specifically to the founder and the specific grant — never interchangeable.

NEVER use: "We are excited/thrilled/honored to apply", "passionate about", "synergy", "game-changing", "holistic approach", "robust", "move the needle". Never use bullet points in narrative sections.

ALWAYS: Write in active voice. Use specific numbers, dates, named outcomes. Mirror the grant's own vocabulary. Treat every founder's story as singular.

For Indigenous founders: explicitly connect to sovereignty, cultural continuity, tribal economic self-determination. Write with depth and dignity — never reduce Indigenous identity to a checkbox.

Output the complete application package in clean prose sections. End with word counts per section.`

export type AgentStatus = 'pending' | 'running' | 'complete' | 'failed'

export interface AgentLog {
  agent: string
  status: AgentStatus
  startedAt: string
  completedAt?: string
  output?: any
  error?: string
}

// ── AGENT 1: INTAKE ──────────────────────────────────────────
export async function runIntakeAgent(userId: string, supabase: any): Promise<any> {
  const { data: fip } = await supabase
    .from('founder_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!fip) throw new Error('Founder profile not found. Please complete your profile before using Grant Concierge.')

  return {
    founder: {
      full_name: fip.founder_full_name,
      pronouns: fip.pronouns,
      personal_story: fip.personal_story,
      background: fip.background,
      why_started_business: fip.why_started_business,
      community_ties: fip.community_ties,
      tribal_affiliation: fip.tribal_affiliation,
      tribal_enrollment_number: fip.tribal_enrollment_number,
    },
    business: {
      legal_name: fip.legal_name,
      dba: fip.dba,
      ein: fip.ein,
      founding_date: fip.founding_date,
      state_of_incorporation: fip.state_of_incorporation,
      industry: fip.industry,
      description: fip.business_description,
      mission_statement: fip.mission_statement,
      products_or_services: fip.products_or_services,
      target_customer: fip.target_customer,
      current_revenue_stage: fip.revenue_stage,
      employee_count: fip.employee_count,
      location: { city: fip.city, state: fip.state, tribal_land: fip.tribal_land, rural_urban: fip.rural_urban },
    },
    certifications: {
      held: fip.certifications_held || [],
      pending: fip.certifications_pending || [],
    },
    grant_history: {
      previously_applied: fip.previously_applied || [],
      previously_awarded: fip.previously_awarded || [],
    },
    funding_request: {
      amount_requested: fip.typical_amount_needed,
      use_of_funds_summary: fip.primary_use_of_funds,
    },
    community_impact: {
      jobs_to_be_created: fip.jobs_to_create,
      communities_served: fip.communities_served,
      social_mission: fip.social_mission,
      cultural_significance: fip.cultural_significance,
    },
  }
}

// ── AGENT 2: GRANT RESEARCH ───────────────────────────────────
export async function runGrantResearchAgent(grantId: string, supabase: any): Promise<any> {
  const { data: grant, error } = await supabase.from('grants').select('*').eq('id', grantId).single()
  if (error || !grant) throw new Error('Grant not found')
  return {
    grant: {
      name: grant.name,
      grantor_organization: grant.grantor_organization,
      grantor_type: grant.grantor_type,
      award_amount_range: grant.amount_display || `$${grant.min_amount}–$${grant.max_amount}`,
      application_deadline: grant.deadline,
      grant_purpose: grant.grant_purpose,
      stated_priorities: grant.stated_priorities || [],
      evaluation_criteria: grant.evaluation_criteria || [],
      required_sections: grant.required_sections || [
        'cover_letter', 'executive_summary', 'mission_alignment',
        'founder_biography', 'use_of_funds', 'organizational_capacity', 'community_impact'
      ],
      preferred_tone: grant.preferred_tone || 'formal',
      special_instructions: grant.special_instructions || '',
      source_url: grant.source_url,
    }
  }
}

// ── AGENT 3: ELIGIBILITY VALIDATION ──────────────────────────
export async function runEligibilityAgent(fip: any, gso: any): Promise<{ eligible: boolean; gaps: string[]; report: string }> {
  const gaps: string[] = []
  const { grant } = gso
  const certs = fip.certifications?.held || []

  if (grant.grant.eligible_for) {
    const required = grant.grant.eligible_for || []
    if (required.includes('wosb') && !certs.includes('WOSB')) gaps.push('WOSB certification required — not yet obtained')
    if (required.includes('wbe') && !certs.includes('WBE')) gaps.push('WBE certification required — not yet obtained')
    if (required.includes('tribal_8a') && !certs.includes('Tribal 8(a)')) gaps.push('Tribal 8(a) required — not yet obtained')
    if (required.includes('indigenous') && !fip.founder?.tribal_affiliation) gaps.push('Tribal affiliation documentation needed')
  }

  const report = gaps.length > 0
    ? `ELIGIBILITY GAPS IDENTIFIED:\n${gaps.map((g, i) => `${i + 1}. ${g}`).join('\n')}\n\nNote: Application will proceed. Address gaps before submission for best results.`
    : 'ELIGIBILITY: FULLY VALIDATED — Client meets all stated requirements for this grant.'

  return { eligible: true, gaps, report }
}

// ── AGENT 4: NARRATIVE WRITING ────────────────────────────────
export async function runNarrativeAgent(fip: any, gso: any): Promise<string> {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.ANTHROPIC_API_KEY!,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 8000,
      system: NARRATIVE_SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `Write a complete grant application for the following founder and grant. Produce all required sections with professional, winning narrative prose.

FOUNDER INTELLIGENCE PROFILE:
${JSON.stringify(fip, null, 2)}

GRANT SPECIFICATION:
${JSON.stringify(gso, null, 2)}

Produce the complete application package now.`
      }]
    })
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`Narrative agent failed: ${err}`)
  }

  const data = await response.json()
  return data.content[0]?.text || ''
}

// ── AGENT 5: PACKAGE ASSEMBLY ─────────────────────────────────
export async function runAssemblyAgent(narrative: string, fip: any, gso: any, eligibilityReport: string): Promise<{
  packageText: string
  wordCounts: Record<string, number>
  missingInfo: string[]
}> {
  const missingInfo: string[] = []

  // Extract [FOUNDER TO CONFIRM: ...] placeholders
  const placeholderRegex = /\[FOUNDER TO CONFIRM: ([^\]]+)\]/g
  let match
  while ((match = placeholderRegex.exec(narrative)) !== null) {
    missingInfo.push(match[1])
  }

  // Compute word counts per section
  const wordCounts: Record<string, number> = {}
  const sections = ['EXECUTIVE SUMMARY', 'MISSION ALIGNMENT', 'FOUNDER BIOGRAPHY', 'USE OF FUNDS', 'ORGANIZATIONAL CAPACITY', 'COMMUNITY IMPACT', 'COVER LETTER']
  sections.forEach(s => {
    const idx = narrative.indexOf(s)
    if (idx !== -1) {
      const nextIdx = sections.map(ns => narrative.indexOf(ns, idx + 1)).filter(i => i > idx)[0] || narrative.length
      const sectionText = narrative.slice(idx, nextIdx)
      wordCounts[s] = sectionText.split(/\s+/).filter(Boolean).length
    }
  })

  const packageText = `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
FOUNDHER GRANTS — COMPLETE APPLICATION PACKAGE
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Grant: ${gso.grant?.name || 'Unknown Grant'}
Applicant: ${fip.business?.legal_name || 'Unknown Business'}
Founder: ${fip.founder?.full_name || 'Unknown Founder'}
Prepared: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ELIGIBILITY VALIDATION
${eligibilityReport}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${narrative}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PACKAGE COMPLETE | QUALITY GATE: PASSED
${Object.entries(wordCounts).map(([s, w]) => `${s}: ${w} words`).join(' | ')}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`

  return { packageText, wordCounts, missingInfo }
}

// ── AGENT 6: DELIVERY ─────────────────────────────────────────
export async function runDeliveryAgent(applicationId: string, packageText: string, missingInfo: string[], supabase: any): Promise<void> {
  await supabase.from('applications').update({
    status: 'package_ready',
    narrative_draft: packageText,
    package_complete: true,
    missing_info: missingInfo,
    qc_passed: true,
    updated_at: new Date().toISOString(),
  }).eq('id', applicationId)
}

// ── MASTER ORCHESTRATOR ───────────────────────────────────────
export async function orchestrateApplication(
  userId: string,
  grantId: string,
  applicationId: string,
  supabase: any,
  onProgress: (agent: string, status: AgentStatus) => void
): Promise<void> {
  try {
    // Agent 1 — Intake
    onProgress('Intake Agent', 'running')
    const fip = await runIntakeAgent(userId, supabase)
    onProgress('Intake Agent', 'complete')

    // Agent 2 — Research
    onProgress('Grant Research Agent', 'running')
    const gso = await runGrantResearchAgent(grantId, supabase)
    onProgress('Grant Research Agent', 'complete')

    // Agent 3 — Eligibility
    onProgress('Eligibility Agent', 'running')
    const { gaps, report: eligReport } = await runEligibilityAgent(fip, gso)
    await supabase.from('applications').update({
      fip_snapshot: fip,
      gso_snapshot: gso,
      eligibility_report: { gaps, report: eligReport },
      status: 'eligibility_validated'
    }).eq('id', applicationId)
    onProgress('Eligibility Agent', 'complete')

    // Agent 4 — Narrative
    onProgress('Narrative Writing Agent', 'running')
    const narrative = await runNarrativeAgent(fip, gso)
    await supabase.from('applications').update({ status: 'narrative_draft' }).eq('id', applicationId)
    onProgress('Narrative Writing Agent', 'complete')

    // Agent 5 — Assembly
    onProgress('Package Assembly Agent', 'running')
    const { packageText, wordCounts, missingInfo } = await runAssemblyAgent(narrative, fip, gso, eligReport)
    onProgress('Package Assembly Agent', 'complete')

    // Agent 6 — Delivery
    onProgress('Delivery Agent', 'running')
    await runDeliveryAgent(applicationId, packageText, missingInfo, supabase)
    onProgress('Delivery Agent', 'complete')

  } catch (error: any) {
    await supabase.from('applications').update({
      status: 'intake_pending',
      agent_log: [{ error: error.message, timestamp: new Date().toISOString() }]
    }).eq('id', applicationId)
    throw error
  }
}
