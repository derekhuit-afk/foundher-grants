import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SEED_SECRET = process.env.CRON_SECRET || 'foundher_cron_2025_secure'

async function tryCreateTable(): Promise<{ method: string; success: boolean; error?: string }> {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const ref = url.replace('https://', '').replace('.supabase.co', '')

  const createSQL = `
    CREATE TABLE IF NOT EXISTS public.grants (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL,
      grantor_organization text NOT NULL,
      grantor_type text DEFAULT 'other',
      min_amount integer DEFAULT 0,
      max_amount integer DEFAULT 0,
      amount_display text,
      deadline date,
      description text,
      grant_purpose text,
      eligible_for text[] DEFAULT '{}',
      competition_level text DEFAULT 'medium',
      featured boolean DEFAULT false,
      is_active boolean DEFAULT true,
      source_url text,
      states_eligible text[] DEFAULT '{}',
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now()
    );
    CREATE INDEX IF NOT EXISTS grants_eligible_for_idx ON public.grants USING GIN (eligible_for);
    CREATE INDEX IF NOT EXISTS grants_states_idx ON public.grants USING GIN (states_eligible);
    ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
    DO $pol$
    BEGIN
      IF NOT EXISTS (SELECT FROM pg_policies WHERE tablename='grants' AND policyname='public_read') THEN
        CREATE POLICY public_read ON public.grants FOR SELECT USING (is_active = true);
      END IF;
    END $pol$;
  `

  // Try method 1: pg-meta (available from within Vercel)
  try {
    const r = await fetch(`${url}/pg/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ query: createSQL }),
    })
    if (r.ok) return { method: 'pg-meta', success: true }
  } catch {}

  // Try method 2: Management API
  try {
    const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
      body: JSON.stringify({ query: createSQL }),
    })
    if (r.ok) return { method: 'mgmt-api', success: true }
    const txt = await r.text()
    return { method: 'mgmt-api', success: false, error: `${r.status}: ${txt.slice(0, 200)}` }
  } catch (e: any) {
    return { method: 'all-failed', success: false, error: e.message }
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runSeed()
}

export async function POST(req: Request) {
  const auth = req.headers.get('x-seed-secret')
  if (auth !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return runSeed()
}

async function runSeed() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  )

  const log: any = {}

  // Step 1: Check if table exists
  const { error: checkErr } = await supabase.from('grants').select('id').limit(1)
  const tableExists = !checkErr || !checkErr.message.includes('does not exist')
  log.tableExistsInitially = tableExists
  log.checkError = checkErr?.message

  // Step 2: If not, try to create it
  if (!tableExists) {
    const createResult = await tryCreateTable()
    log.tableCreateAttempt = createResult

    // Re-check
    const { error: reCheck } = await supabase.from('grants').select('id').limit(1)
    log.tableExistsAfterCreate = !reCheck || !reCheck.message.includes('does not exist')
    log.reCheckError = reCheck?.message

    if (!log.tableExistsAfterCreate) {
      return NextResponse.json({
        success: false,
        message: 'Table creation failed. The grants table needs to be created manually.',
        schemaUrl: 'https://supabase.com/dashboard/project/vvkdnzqgtajeouxlliuk/sql',
        createResult,
        log,
      }, { status: 500 })
    }
  }

  // Step 3: Load grants JSON from filesystem
  let grants: any[]
  try {
    const filePath = join(process.cwd(), 'lib', 'grants-data.json')
    const raw = readFileSync(filePath, 'utf-8')
    grants = JSON.parse(raw)
    log.grantsLoaded = grants.length
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Failed to load grants-data.json: ' + e.message }, { status: 500 })
  }

  // Step 4: Wipe existing grants
  const { error: delErr } = await supabase.from('grants').delete().neq('id', '00000000-0000-0000-0000-000000000000')
  log.deleteError = delErr?.message

  // Step 5: Insert in batches of 250
  const BATCH = 250
  let inserted = 0
  const errors: string[] = []

  for (let i = 0; i < grants.length; i += BATCH) {
    const batch = grants.slice(i, i + BATCH).map((g: any) => ({
      name: String(g.name || '').slice(0, 500),
      grantor_organization: String(g.grantor_organization || '').slice(0, 500),
      grantor_type: g.grantor_type || 'other',
      min_amount: Number(g.min_amount) || 0,
      max_amount: Number(g.max_amount) || 0,
      amount_display: g.amount_display ? String(g.amount_display).slice(0, 100) : null,
      deadline: g.deadline || null,
      description: g.description ? String(g.description).slice(0, 2000) : null,
      grant_purpose: g.grant_purpose ? String(g.grant_purpose).slice(0, 500) : null,
      eligible_for: Array.isArray(g.eligible_for) ? g.eligible_for : [],
      competition_level: g.competition_level || 'medium',
      featured: Boolean(g.featured),
      is_active: g.is_active !== false,
      source_url: g.source_url ? String(g.source_url).slice(0, 500) : null,
      states_eligible: Array.isArray(g.states_eligible) ? g.states_eligible : [],
    }))

    const { error: insErr } = await supabase.from('grants').insert(batch)
    if (insErr) {
      errors.push(`Batch ${i / BATCH + 1} (rows ${i}–${i + BATCH}): ${insErr.message}`)
      if (errors.length >= 5) break
    } else {
      inserted += batch.length
    }
  }

  // Final count
  const { count: finalCount } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    success: errors.length === 0,
    message: `✅ Seeded ${inserted}/${grants.length} grants. Database total: ${finalCount}`,
    inserted,
    total: grants.length,
    finalDatabaseCount: finalCount,
    batchErrors: errors.length > 0 ? errors : undefined,
    log,
  })
}
