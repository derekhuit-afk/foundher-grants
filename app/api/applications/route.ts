import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { orchestrateApplication } from '@/lib/agents/orchestrator'

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const { userId, grantId } = await req.json()

  if (!userId || !grantId) return NextResponse.json({ error: 'Missing userId or grantId' }, { status: 400 })

  // Verify user has Tier 2
  const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', userId).single()
  if (profile?.subscription_tier !== 'tier2') {
    return NextResponse.json({ error: 'Grant Concierge requires Tier 2 subscription.' }, { status: 403 })
  }

  // Create application record
  const { data: app, error: appErr } = await supabase.from('applications').insert({
    user_id: userId,
    grant_id: grantId,
    status: 'intake_pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }).select().single()

  if (appErr || !app) return NextResponse.json({ error: 'Failed to create application' }, { status: 500 })

  // Run pipeline (fire and forget — client polls for updates)
  orchestrateApplication(userId, grantId, app.id, supabase, (agent, status) => {
    console.log(`[${agent}] ${status}`)
  }).catch(err => console.error('Pipeline error:', err))

  return NextResponse.json({ applicationId: app.id, status: 'pipeline_started' })
}
