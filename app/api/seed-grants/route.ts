import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const SEED_SECRET = process.env.CRON_SECRET || 'foundher_cron_2025_secure'

function tableNotFound(errMsg?: string) {
  if (!errMsg) return false
  return (
    errMsg.includes('does not exist') ||
    errMsg.includes('schema cache') ||
    errMsg.includes('Could not find the table') ||
    errMsg.includes('relation') ||
    errMsg.includes('PGRST205') ||
    errMsg.includes('undefined')
  )
}

const CREATE_SQL = `
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
`

async function createTable(url: string, key: string, ref: string): Promise<string> {
  const methods = [
    // 1. pg-meta /pg/query
    async () => {
      const r = await fetch(`${url}/pg/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ query: CREATE_SQL }),
      })
      if (r.ok) return 'pg-meta'
      throw new Error(`pg-meta ${r.status}: ${await r.text().catch(() => '')}`)
    },
    // 2. pg-meta with different path
    async () => {
      const r = await fetch(`${url}/pg/tables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ name: 'grants', schema: 'public' }),
      })
      if (r.ok) return 'pg-meta-tables'
      throw new Error(`pg-meta-tables ${r.status}`)
    },
    // 3. Management API
    async () => {
      const r = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ query: CREATE_SQL }),
      })
      if (r.ok) return 'mgmt-api'
      throw new Error(`mgmt-api ${r.status}: ${await r.text().catch(() => '')}`)
    },
    // 4. Internal pg REST
    async () => {
      const r = await fetch(`${url}/rest/v1/rpc/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
        body: JSON.stringify({ sql: CREATE_SQL }),
      })
      if (r.ok) return 'rpc-query'
      throw new Error(`rpc-query ${r.status}`)
    },
  ]

  const errors: string[] = []
  for (const fn of methods) {
    try {
      return await fn()
    } catch (e: any) {
      errors.push(e.message)
    }
  }
  throw new Error('All methods failed: ' + errors.join(' | '))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  if (searchParams.get('secret') !== SEED_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // Diagnostic mode
  if (searchParams.get('diag') === '1') {
    return diagnose()
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

async function diagnose() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const ref = url.replace('https://', '').replace('.supabase.co', '')

  const checks: Record<string, any> = {}

  const endpoints = [
    { name: 'pg/query', url: `${url}/pg/query`, body: { query: 'SELECT current_database()' } },
    { name: 'pg/tables', url: `${url}/pg/tables`, body: null },
    { name: 'mgmt-query', url: `https://api.supabase.com/v1/projects/${ref}/database/query`, body: { query: 'SELECT 1' } },
    { name: 'rest/schemas', url: `${url}/rest/v1/?apikey=${key}`, body: null },
  ]

  for (const ep of endpoints) {
    try {
      const r = await fetch(ep.url, ep.body ? {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'apikey': key, 'Authorization': `Bearer ${key}` },
        body: JSON.stringify(ep.body),
      } : {
        headers: { 'apikey': key, 'Authorization': `Bearer ${key}` }
      })
      const text = await r.text().catch(() => '')
      checks[ep.name] = { status: r.status, ok: r.ok, body: text.slice(0, 200) }
    } catch (e: any) {
      checks[ep.name] = { error: e.message }
    }
  }

  return NextResponse.json({ diagnostics: checks })
}

async function runSeed() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  const ref = url.replace('https://', '').replace('.supabase.co', '')

  const supabase = createClient(url, key, { auth: { persistSession: false } })
  const log: any = {}

  // Step 1: Check if table exists (handle all error variants)
  const { data: checkData, error: checkErr } = await supabase.from('grants').select('id').limit(1)
  const tableExists = !tableNotFound(checkErr?.message)
  log.tableExistsInitially = tableExists
  log.checkError = checkErr?.message

  // Step 2: Create table if it doesn't exist
  if (!tableExists) {
    try {
      const method = await createTable(url, key, ref)
      log.tableCreatedVia = method

      // Supabase needs schema cache refresh — wait then re-check
      await new Promise(r => setTimeout(r, 2000))

      const { error: reErr } = await supabase.from('grants').select('id').limit(1)
      log.tableExistsAfterCreate = !tableNotFound(reErr?.message)
      log.reCheckError = reErr?.message

      if (!log.tableExistsAfterCreate) {
        // Schema cache issue — try with a direct REST call
        const testR = await fetch(`${url}/rest/v1/grants?select=id&limit=1`, {
          headers: { 'apikey': key, 'Authorization': `Bearer ${key}`, 'Accept': 'application/json' }
        })
        log.directRestCheck = testR.status
        log.tableExistsAfterCreate = testR.status !== 404 && testR.status !== 400
      }
    } catch (e: any) {
      log.tableCreateError = e.message
      return NextResponse.json({
        success: false,
        message: 'Cannot create grants table via any available API endpoint.',
        detail: 'This Supabase project requires a Personal Access Token (PAT) to run DDL migrations.',
        solution: 'Visit https://supabase.com/dashboard/project/vvkdnzqgtajeouxlliuk/sql and run the grants table schema, then re-call this endpoint.',
        log,
      }, { status: 500 })
    }
  }

  // Step 3: Load grants JSON
  let grants: any[]
  try {
    const raw = readFileSync(join(process.cwd(), 'lib', 'grants-data.json'), 'utf-8')
    grants = JSON.parse(raw)
    log.grantsInFile = grants.length
  } catch (e: any) {
    return NextResponse.json({ success: false, error: 'Failed to read grants-data.json: ' + e.message }, { status: 500 })
  }

  // Step 4: Wipe existing
  const { error: delErr } = await supabase
    .from('grants')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000')
  log.deleteError = delErr?.message

  // Step 5: Insert in batches of 250
  const BATCH = 250
  let inserted = 0
  const batchErrors: string[] = []

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
      batchErrors.push(`Batch ${Math.floor(i / BATCH) + 1}: ${insErr.message}`)
      if (batchErrors.length >= 5) break
    } else {
      inserted += batch.length
    }
  }

  const { count: finalCount } = await supabase
    .from('grants')
    .select('*', { count: 'exact', head: true })

  return NextResponse.json({
    success: batchErrors.length === 0,
    message: `${batchErrors.length === 0 ? '✅' : '⚠️'} Seeded ${inserted}/${grants.length} grants. DB total: ${finalCount ?? 'unknown'}`,
    inserted,
    total: grants.length,
    finalDatabaseCount: finalCount,
    batchErrors: batchErrors.length > 0 ? batchErrors : undefined,
    log,
  })
}
