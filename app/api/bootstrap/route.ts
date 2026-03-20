import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

export const dynamic = 'force-dynamic'
export const maxDuration = 300

const BOOTSTRAP_SECRET = process.env.CRON_SECRET || 'foundher_cron_2025_secure'

export async function GET(req: Request) {
  const url = new URL(req.url)
  if (url.searchParams.get('secret') !== BOOTSTRAP_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!supabaseUrl || !serviceKey) {
    return NextResponse.json({ error: 'Missing SUPABASE env vars' }, { status: 500 })
  }

  const log: string[] = []
  const push = (msg: string) => { log.push(msg); console.log(msg) }

  // Use fetch directly against the pg-meta SQL endpoint with service key
  async function runSQL(sql: string): Promise<{ ok: boolean; error?: string }> {
    // Method 1: Try exec_sql RPC
    try {
      const res = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'apikey': serviceKey,
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: sql }),
      })
      if (res.ok) return { ok: true }
      // If 404, exec_sql doesn't exist yet
      if (res.status !== 404) {
        const body = await res.text()
        return { ok: false, error: `rpc ${res.status}: ${body.substring(0, 200)}` }
      }
    } catch (e: any) {
      // fall through
    }
    return { ok: false, error: 'exec_sql not available' }
  }

  // Step 1: Create exec_sql function using supabase-js admin
  // The only way to create a function without exec_sql is via the Management API
  // or the Supabase Dashboard. Let's try a creative workaround:
  // Use the service role to insert into a temporary table, which triggers a function.
  // Actually, the simplest: use the supabase-js SQL channel if available.
  
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })

  // Check if exec_sql already exists
  const { error: rpcErr } = await supabase.rpc('exec_sql', { query: 'SELECT 1' })
  
  if (rpcErr && rpcErr.message.includes('Could not find')) {
    push('exec_sql does not exist. Attempting to create it via Management API...')
    
    // Try Supabase Management API
    const ref = 'vvkdnzqgtajeouxlliuk'
    const mgmtSql = `
      CREATE OR REPLACE FUNCTION public.exec_sql(query text)
      RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
      BEGIN EXECUTE query; RETURN json_build_object('success', true);
      EXCEPTION WHEN OTHERS THEN RETURN json_build_object('success', false, 'error', SQLERRM);
      END; $$;
    `
    
    // Method: POST to Supabase Management API
    try {
      const mgmtRes = await fetch(`https://api.supabase.com/v1/projects/${ref}/database/query`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${serviceKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: mgmtSql }),
      })
      if (mgmtRes.ok) {
        push('✅ Created exec_sql via Management API')
      } else {
        const body = await mgmtRes.text()
        push(`Management API: ${mgmtRes.status} — ${body.substring(0, 200)}`)
        
        // Last resort: return SQL for manual execution
        return NextResponse.json({
          success: false,
          message: 'Cannot create exec_sql function automatically. Please run this SQL in Supabase Dashboard → SQL Editor, then re-call this endpoint.',
          sql: getFullMigrationSQL(),
          log,
        })
      }
    } catch (e: any) {
      push(`Management API error: ${e.message}`)
      return NextResponse.json({
        success: false,
        message: 'Cannot reach Supabase Management API. Please run the migration SQL manually.',
        sql: getFullMigrationSQL(),
        log,
      })
    }
  } else if (!rpcErr) {
    push('✅ exec_sql already exists')
  } else {
    push(`exec_sql check: ${rpcErr.message}`)
  }

  // Step 2: Create tables
  const ddl = [
    `CREATE TABLE IF NOT EXISTS public.grants (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      name text NOT NULL, grantor_organization text NOT NULL,
      grantor_type text DEFAULT 'other',
      min_amount integer DEFAULT 0, max_amount integer DEFAULT 0,
      amount_display text, deadline date, description text, grant_purpose text,
      eligible_for text[] DEFAULT '{}', competition_level text DEFAULT 'medium',
      featured boolean DEFAULT false, is_active boolean DEFAULT true,
      source_url text, states_eligible text[] DEFAULT '{}',
      rural_only boolean DEFAULT false, tribal_only boolean DEFAULT false,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS public.founder_profiles (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL UNIQUE,
      business_name text, business_type text, industry text,
      state text, city text, zip text,
      tribal_affiliation text, founder_pronouns text,
      certifications_held text[] DEFAULT '{}',
      annual_revenue text, employee_count text, years_in_business text,
      rural_urban text, goals text,
      onboarding_complete boolean DEFAULT false,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    )`,
    `CREATE TABLE IF NOT EXISTS public.saved_grants (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL,
      grant_id uuid NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
      created_at timestamptz DEFAULT now(),
      UNIQUE(user_id, grant_id)
    )`,
    `CREATE TABLE IF NOT EXISTS public.grant_applications (
      id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
      user_id uuid NOT NULL,
      grant_id uuid NOT NULL REFERENCES public.grants(id),
      status text DEFAULT 'draft', narrative text,
      budget_json jsonb DEFAULT '{}', submitted_at timestamptz,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    )`,
  ]

  for (const sql of ddl) {
    const result = await runSQL(sql)
    const tableName = sql.match(/public\.(\w+)/)?.[1] || 'unknown'
    if (result.ok) {
      push(`✅ Table ${tableName} ready`)
    } else {
      push(`❌ Table ${tableName}: ${result.error}`)
    }
  }

  // Step 3: RLS policies
  const policies = [
    `ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN CREATE POLICY "grants_public_read" ON public.grants FOR SELECT USING (true); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN CREATE POLICY "fp_select" ON public.founder_profiles FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "fp_insert" ON public.founder_profiles FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "fp_update" ON public.founder_profiles FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `ALTER TABLE public.saved_grants ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN CREATE POLICY "sg_select" ON public.saved_grants FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "sg_insert" ON public.saved_grants FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "sg_delete" ON public.saved_grants FOR DELETE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY`,
    `DO $$ BEGIN CREATE POLICY "ga_select" ON public.grant_applications FOR SELECT USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "ga_insert" ON public.grant_applications FOR INSERT WITH CHECK (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
    `DO $$ BEGIN CREATE POLICY "ga_update" ON public.grant_applications FOR UPDATE USING (auth.uid() = user_id); EXCEPTION WHEN duplicate_object THEN NULL; END $$`,
  ]

  for (const sql of policies) {
    const result = await runSQL(sql)
    if (result.ok) push(`✅ Policy applied`)
    else push(`⚠️ Policy: ${result.error?.substring(0, 100)}`)
  }

  // Step 4: Seed grants data
  push('Loading grants data...')
  let grantsData: any[] = []
  try {
    const raw = readFileSync(join(process.cwd(), 'lib', 'grants-data.json'), 'utf-8')
    grantsData = JSON.parse(raw)
    push(`Loaded ${grantsData.length} grants from data file`)
  } catch (e: any) {
    push(`Failed to load grants data: ${e.message}`)
    return NextResponse.json({ success: false, log })
  }

  // Check current count
  const { count } = await supabase.from('grants').select('id', { count: 'exact', head: true })
  push(`Current grants in DB: ${count || 0}`)

  if ((count || 0) < 100) {
    // Seed in batches of 200
    let inserted = 0
    for (let i = 0; i < grantsData.length; i += 200) {
      const batch = grantsData.slice(i, i + 200)
      const { error } = await supabase.from('grants').upsert(batch, { onConflict: 'name,grantor_organization' })
      if (error) {
        // Try insert instead
        const { error: insertErr } = await supabase.from('grants').insert(batch)
        if (insertErr) {
          push(`⚠️ Batch ${i}-${i + batch.length}: ${insertErr.message.substring(0, 100)}`)
        } else {
          inserted += batch.length
        }
      } else {
        inserted += batch.length
      }
    }
    push(`✅ Seeded ${inserted} grants`)
  } else {
    push(`Skipping seed — ${count} grants already in DB`)
  }

  // Final count
  const { count: finalCount } = await supabase.from('grants').select('id', { count: 'exact', head: true })
  push(`Final grant count: ${finalCount || 0}`)

  return NextResponse.json({ success: true, grantCount: finalCount, log })
}

function getFullMigrationSQL(): string {
  return `
-- FoundHer Grants — Full Migration
-- Run this in Supabase Dashboard → SQL Editor

CREATE OR REPLACE FUNCTION public.exec_sql(query text)
RETURNS json LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN EXECUTE query; RETURN json_build_object('success', true);
EXCEPTION WHEN OTHERS THEN RETURN json_build_object('success', false, 'error', SQLERRM);
END; $$;

CREATE TABLE IF NOT EXISTS public.grants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL, grantor_organization text NOT NULL,
  grantor_type text DEFAULT 'other',
  min_amount integer DEFAULT 0, max_amount integer DEFAULT 0,
  amount_display text, deadline date, description text, grant_purpose text,
  eligible_for text[] DEFAULT '{}', competition_level text DEFAULT 'medium',
  featured boolean DEFAULT false, is_active boolean DEFAULT true,
  source_url text, states_eligible text[] DEFAULT '{}',
  rural_only boolean DEFAULT false, tribal_only boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.founder_profiles (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  business_name text, business_type text, industry text,
  state text, city text, zip text,
  tribal_affiliation text, founder_pronouns text,
  certifications_held text[] DEFAULT '{}',
  annual_revenue text, employee_count text, years_in_business text,
  rural_urban text, goals text,
  onboarding_complete boolean DEFAULT false,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.saved_grants (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  grant_id uuid NOT NULL REFERENCES public.grants(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, grant_id)
);

CREATE TABLE IF NOT EXISTS public.grant_applications (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  grant_id uuid NOT NULL REFERENCES public.grants(id),
  status text DEFAULT 'draft', narrative text,
  budget_json jsonb DEFAULT '{}', submitted_at timestamptz,
  created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.founder_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_grants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grant_applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "grants_public_read" ON public.grants FOR SELECT USING (true);
CREATE POLICY "fp_select" ON public.founder_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "fp_insert" ON public.founder_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "fp_update" ON public.founder_profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "sg_select" ON public.saved_grants FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sg_insert" ON public.saved_grants FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sg_delete" ON public.saved_grants FOR DELETE USING (auth.uid() = user_id);
CREATE POLICY "ga_select" ON public.grant_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "ga_insert" ON public.grant_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "ga_update" ON public.grant_applications FOR UPDATE USING (auth.uid() = user_id);
`
}
