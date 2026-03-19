-- FoundHer Grants — Complete Database Schema
-- Run this in your Supabase SQL Editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ============================================================
-- PROFILES (extends auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  business_name text,
  subscription_tier text default 'free' check (subscription_tier in ('free','tier1','tier2')),
  subscription_status text default 'inactive' check (subscription_status in ('active','inactive','canceled','past_due')),
  stripe_customer_id text unique,
  stripe_subscription_id text,
  onboarding_completed boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.profiles enable row level security;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- ============================================================
-- FOUNDER INTELLIGENCE PROFILES (FIP)
-- ============================================================
create table public.founder_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,

  -- Founder
  founder_full_name text,
  pronouns text,
  personal_story text,
  background text,
  why_started_business text,
  community_ties text,
  tribal_affiliation text,
  tribal_enrollment_number text,

  -- Business
  legal_name text,
  dba text,
  ein text,
  founding_date date,
  state_of_incorporation text,
  industry text,
  business_description text,
  mission_statement text,
  products_or_services text,
  target_customer text,
  revenue_stage text check (revenue_stage in ('pre-revenue','under_100k','100k_500k','over_500k')),
  employee_count int default 0,
  city text,
  state text,
  tribal_land text,
  rural_urban text check (rural_urban in ('rural','urban','suburban')),

  -- Certifications
  certifications_held text[] default '{}',
  certifications_pending text[] default '{}',

  -- Grant History
  previously_applied text[] default '{}',
  previously_awarded text[] default '{}',

  -- Funding Intent
  typical_amount_needed text,
  primary_use_of_funds text,

  -- Community Impact
  communities_served text,
  social_mission text,
  cultural_significance text,
  jobs_to_create int default 0,

  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

alter table public.founder_profiles enable row level security;
create policy "Users can manage own FIP" on public.founder_profiles for all using (auth.uid() = user_id);

-- ============================================================
-- GRANTS DATABASE
-- ============================================================
create table public.grants (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  grantor_organization text not null,
  grantor_type text check (grantor_type in ('federal','state','local','private_foundation','corporate','tribal')),
  
  -- Amounts
  min_amount int,
  max_amount int,
  amount_display text, -- e.g. "Up to $50,000"
  
  -- Timing
  deadline date,
  deadline_recurring boolean default false,
  deadline_notes text,
  
  -- Details
  description text,
  grant_purpose text,
  stated_priorities text[],
  evaluation_criteria text[],
  required_sections jsonb,
  special_instructions text,
  preferred_tone text default 'formal',
  
  -- Eligibility Filters
  eligible_for text[] default '{}', -- ['women_owned','indigenous','wosb','wbe','tribal_8a','bipoc','veteran']
  states_eligible text[] default '{}', -- empty = all states
  rural_only boolean default false,
  min_business_age_months int default 0,
  max_revenue int, -- null = no limit
  certifications_required text[] default '{}',
  
  -- Match Data
  competition_level text check (competition_level in ('low','medium','high','very_high')),
  avg_award_amount int,
  acceptance_rate numeric(5,2),
  
  -- Admin
  source_url text,
  application_url text,
  last_verified date default current_date,
  is_active boolean default true,
  featured boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.grants enable row level security;
create policy "Active grants readable by authenticated users" on public.grants for select using (auth.role() = 'authenticated' and is_active = true);
create policy "Admins can manage grants" on public.grants for all using (auth.jwt() ->> 'email' in (select email from public.profiles where subscription_tier = 'admin'));

-- ============================================================
-- SAVED GRANTS
-- ============================================================
create table public.saved_grants (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  grant_id uuid references public.grants(id) on delete cascade not null,
  status text default 'saved' check (status in ('saved','applied','won','declined','expired')),
  notes text,
  match_score int,
  saved_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id, grant_id)
);

alter table public.saved_grants enable row level security;
create policy "Users manage own saved grants" on public.saved_grants for all using (auth.uid() = user_id);

-- ============================================================
-- APPLICATIONS (Tier 2 — Done For You)
-- ============================================================
create table public.applications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  grant_id uuid references public.grants(id) not null,
  
  -- Status Pipeline
  status text default 'intake_pending' check (status in (
    'intake_pending','intake_complete','research_complete',
    'eligibility_validated','narrative_draft','package_ready',
    'delivered','submitted','awarded','declined'
  )),
  
  -- Agent Pipeline State
  fip_snapshot jsonb, -- FIP at time of application
  gso_snapshot jsonb, -- Grant spec at time of application
  eligibility_report jsonb,
  narrative_draft text,
  package_complete boolean default false,
  package_url text,
  submission_guide text,
  
  -- Outcomes
  award_amount int,
  submitted_at timestamptz,
  decision_date date,
  outcome_notes text,
  
  -- Internal
  agent_log jsonb default '[]',
  qc_passed boolean default false,
  missing_info text[],
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.applications enable row level security;
create policy "Users view own applications" on public.applications for select using (auth.uid() = user_id);

-- ============================================================
-- GRANT MATCH SCORES (cached per user)
-- ============================================================
create table public.grant_scores (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  grant_id uuid references public.grants(id) on delete cascade not null,
  score int not null,
  score_breakdown jsonb,
  computed_at timestamptz default now(),
  unique(user_id, grant_id)
);

alter table public.grant_scores enable row level security;
create policy "Users view own scores" on public.grant_scores for select using (auth.uid() = user_id);

-- ============================================================
-- EMAIL ALERT PREFERENCES
-- ============================================================
create table public.alert_preferences (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  weekly_digest boolean default true,
  deadline_alerts boolean default true,
  new_grant_alerts boolean default true,
  upgrade_nudges boolean default true,
  alert_days_before_deadline int default 14,
  created_at timestamptz default now(),
  unique(user_id)
);

alter table public.alert_preferences enable row level security;
create policy "Users manage own alerts" on public.alert_preferences for all using (auth.uid() = user_id);

-- ============================================================
-- SEED: 20 STARTER GRANTS
-- ============================================================
insert into public.grants (name, grantor_organization, grantor_type, min_amount, max_amount, amount_display, deadline, description, grant_purpose, eligible_for, competition_level, featured, source_url) values

('Amber Grant for Women', 'WomensNet', 'private_foundation', 10000, 10000, '$10,000', '2025-12-31', 'Monthly grant awarded to a woman-owned business. One winner per month, plus an annual $25,000 grant from monthly winners.', 'Support women entrepreneurs at any stage of business.', ARRAY['women_owned'], 'medium', true, 'https://ambergrantsforwomen.com'),

('SBA Women-Owned Small Business Federal Contracting Program', 'U.S. Small Business Administration', 'federal', 0, 0, 'Contract Set-Asides', null, 'Federal contracting program giving WOSBs access to sole-source and set-aside contracts in underrepresented industries.', 'Connect women-owned small businesses to federal contracts.', ARRAY['women_owned','wosb'], 'high', true, 'https://sba.gov/federal-contracting/contracting-assistance-programs/women-owned-small-business-federal-contracting-program'),

('Native American Agriculture Fund Grants', 'Native American Agriculture Fund', 'private_foundation', 5000, 100000, '$5,000–$100,000', '2025-09-30', 'Grants supporting Native American and Alaska Native farmers, ranchers, and agricultural enterprises.', 'Advance Native agricultural businesses and food sovereignty.', ARRAY['indigenous','tribal_8a'], 'medium', true, 'https://nativeamericanagriculturefund.org'),

('Fearless Strivers Grant', 'Mastercard', 'corporate', 20000, 20000, '$20,000', '2025-10-15', 'Grant for Black women entrepreneurs with an established business. Includes mentorship and business tools.', 'Advance Black women-owned small businesses.', ARRAY['women_owned','bipoc'], 'high', true, 'https://fearlessstriperscard.com/grant'),

('IFundWomen Universal Grant', 'IFundWomen', 'private_foundation', 500, 50000, 'Varies', null, 'Ongoing grant applications for women-owned businesses. IFundWomen partners with brands to fund grants year-round.', 'Remove funding barriers for women entrepreneurs.', ARRAY['women_owned'], 'medium', false, 'https://ifundwomen.com/grants'),

('First Nations Development Institute Grants', 'First Nations Development Institute', 'private_foundation', 10000, 75000, '$10,000–$75,000', '2025-08-31', 'Grants to strengthen Native economies, promote financial inclusion, and support Indigenous-led organizations and enterprises.', 'Build sustainable Native economies through community-controlled solutions.', ARRAY['indigenous'], 'medium', true, 'https://firstnations.org/grants'),

('USDA Rural Development Business Grants', 'U.S. Department of Agriculture', 'federal', 10000, 500000, 'Up to $500,000', '2025-11-30', 'Rural Business Development Grants (RBDG) support small businesses and entrepreneurs in rural areas.', 'Improve economic conditions in rural communities.', ARRAY['women_owned','indigenous'], 'medium', false, 'https://rd.usda.gov/programs-services/business-programs/rural-business-development-grants'),

('EDA Economic Adjustment Assistance', 'U.S. Economic Development Administration', 'federal', 100000, 5000000, '$100K–$5M', '2025-12-15', 'Flexible grant program for communities and businesses impacted by economic disruption, including minority-owned enterprises.', 'Diversify and strengthen regional economies.', ARRAY['women_owned','indigenous','bipoc'], 'high', false, 'https://eda.gov/funding/programs/economic-adjustment-assistance'),

('Tory Burch Foundation Fellows Program', 'Tory Burch Foundation', 'private_foundation', 5000, 10000, 'Fellowship + Grant', '2025-09-01', 'Annual fellowship for women entrepreneurs providing $10,000 grant, education, mentorship, and community access.', 'Empower women entrepreneurs through education and capital.', ARRAY['women_owned'], 'very_high', true, 'https://toryburchfoundation.org/fellows'),

('Native CDFI Network Capital Access', 'Native CDFI Network', 'private_foundation', 25000, 250000, '$25,000–$250,000', null, 'Capital access programs for Native-owned businesses through certified Native CDFIs. Includes grants and low-interest loans.', 'Expand economic opportunity in Native communities through accessible capital.', ARRAY['indigenous'], 'low', true, 'https://nativecdfi.net'),

('NWBC Small Business Resource Grants', 'National Women''s Business Council', 'federal', 5000, 25000, '$5,000–$25,000', '2025-10-01', 'Research and resource grants for women-owned small businesses. Funded through federal appropriations.', 'Advance policy and programming for women entrepreneurs.', ARRAY['women_owned'], 'medium', false, 'https://nwbc.gov'),

('Minority Business Development Agency Grants', 'U.S. Minority Business Development Agency', 'federal', 50000, 1000000, '$50K–$1M', '2025-11-01', 'MBDA provides grants to minority-owned businesses and MBDA Business Centers supporting minority entrepreneurs.', 'Promote the growth of minority-owned enterprises.', ARRAY['bipoc','indigenous','women_owned'], 'high', false, 'https://mbda.gov'),

('Cartier Women''s Initiative', 'Cartier', 'corporate', 100000, 100000, '$100,000', '2025-11-01', 'International fellowship for women-led impact businesses. Includes $100K grant, coaching, and global visibility.', 'Support women entrepreneurs building businesses that create positive social impact.', ARRAY['women_owned'], 'very_high', true, 'https://cartierwomensinitiative.com'),

('HUD Indian Community Development Block Grant', 'U.S. Department of Housing and Urban Development', 'federal', 50000, 800000, 'Up to $800,000', '2025-08-15', 'ICDBG program provides grants to Indian tribes for community development, housing, and economic development projects.', 'Support economic development and housing in Indian communities.', ARRAY['indigenous','tribal_8a'], 'medium', true, 'https://hud.gov/program_offices/public_indian_housing/ih/grants/icdbg'),

('Goldman Sachs 10,000 Women', 'Goldman Sachs', 'corporate', 0, 0, 'Education + Capital Access', null, 'Business education program for women entrepreneurs globally, with connections to capital and Goldman Sachs network.', 'Empower women entrepreneurs with business education and access to capital.', ARRAY['women_owned'], 'high', false, 'https://10ksbapply.com/women'),

('ONABEN Native Business Fund', 'ONABEN', 'private_foundation', 2500, 15000, '$2,500–$15,000', '2025-09-15', 'Grants and technical assistance for Native American entrepreneurs in the Pacific Northwest and beyond.', 'Grow Native-owned businesses through capital and training.', ARRAY['indigenous'], 'low', false, 'https://onaben.org'),

('Hello Alice Small Business Grant', 'Hello Alice', 'private_foundation', 10000, 25000, '$10,000–$25,000', null, 'Ongoing grant programs for small businesses owned by underrepresented founders including women and people of color.', 'Provide capital to underrepresented small business owners.', ARRAY['women_owned','bipoc','indigenous'], 'high', false, 'https://helloalice.com/grants'),

('SBA 8(a) Business Development Program', 'U.S. Small Business Administration', 'federal', 0, 0, 'Contract Set-Asides + Support', null, 'Nine-year program for socially and economically disadvantaged businesses, including tribal enterprises and women-owned firms.', 'Help disadvantaged businesses compete in the federal marketplace.', ARRAY['indigenous','tribal_8a','bipoc'], 'medium', true, 'https://sba.gov/federal-contracting/contracting-assistance-programs/8a-business-development-program'),

('Eileen Fisher Women-Owned Business Grant', 'Eileen Fisher', 'corporate', 10000, 10000, '$10,000', '2025-10-31', 'Annual grant program for women-owned businesses that demonstrate social consciousness and environmental commitment.', 'Support women entrepreneurs creating positive social and environmental impact.', ARRAY['women_owned'], 'high', false, 'https://eileenfisher.com/grant'),

('BIA Indian Loan Guaranty, Insurance and Interest Subsidy Program', 'Bureau of Indian Affairs', 'federal', 10000, 500000, 'Up to $500,000', null, 'Financial assistance program for Native American-owned businesses through loan guarantees and direct grants via tribal programs.', 'Support the development of Native-owned enterprises and tribal economies.', ARRAY['indigenous','tribal_8a'], 'low', true, 'https://bia.gov/bia/ois/dre');

-- ============================================================
-- FUNCTIONS
-- ============================================================

-- Auto-create profile on user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  insert into public.alert_preferences (user_id)
  values (new.id);
  
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin new.updated_at = now(); return new; end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on public.profiles for each row execute procedure update_updated_at();
create trigger update_fip_updated_at before update on public.founder_profiles for each row execute procedure update_updated_at();
create trigger update_grants_updated_at before update on public.grants for each row execute procedure update_updated_at();
create trigger update_applications_updated_at before update on public.applications for each row execute procedure update_updated_at();
