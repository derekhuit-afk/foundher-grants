'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'

const CERTS = ['WOSB', 'WBE', 'Tribal 8(a)', 'SBA 8(a)', 'MBE', 'DBE', 'HUBZone', 'SDVOSB']
const REVENUE_STAGES = [
  { value: 'pre-revenue', label: 'Pre-revenue' },
  { value: 'under_100k', label: 'Under $100K/year' },
  { value: '100k_500k', label: '$100K–$500K/year' },
  { value: 'over_500k', label: 'Over $500K/year' },
]

const STEPS = [
  { id: 'founder', title: 'About You', subtitle: 'Your story is your strongest grant asset.' },
  { id: 'business', title: 'Your Business', subtitle: 'Tell us about what you\'re building.' },
  { id: 'certifications', title: 'Certifications', subtitle: 'These unlock specific grants for you.' },
  { id: 'impact', title: 'Community Impact', subtitle: 'Funders care about who you serve.' },
  { id: 'funding', title: 'Funding Goals', subtitle: 'What would you do with grant money?' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const params = useSearchParams()
  const [step, setStep] = useState(0)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    founder_full_name: '', pronouns: '', personal_story: '', background: '',
    why_started_business: '', tribal_affiliation: '', community_ties: '',
    legal_name: '', industry: '', business_description: '', mission_statement: '',
    products_or_services: '', target_customer: '', revenue_stage: 'pre-revenue',
    employee_count: 0, state: '', city: '', rural_urban: 'urban',
    certifications_held: [] as string[], certifications_pending: [] as string[],
    communities_served: '', social_mission: '', cultural_significance: '',
    jobs_to_create: 0, primary_use_of_funds: '', typical_amount_needed: '',
  })

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))
  const toggleCert = (cert: string, field: 'certifications_held' | 'certifications_pending') => {
    const arr: string[] = form[field]
    set(field, arr.includes(cert) ? arr.filter(c => c !== cert) : [...arr, cert])
  }

  const save = async () => {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('founder_profiles').upsert({
      user_id: user.id, ...form, updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })

    await supabase.from('profiles').update({ onboarding_completed: true }).eq('id', user.id)

    const tier = params.get('tier')
    if (tier === 'concierge') {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, tier: 'tier2' }),
      })
      const { url } = await res.json()
      if (url) { window.location.href = url; return }
    }

    router.push('/dashboard')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <p className="section-label">Step {step + 1} of {STEPS.length}</p>
            <p className="font-sans text-sm text-charcoal/50">{Math.round(progress)}% complete</p>
          </div>
          <div className="h-1.5 bg-sand-200 rounded-full">
            <div className="h-1.5 bg-clay-500 rounded-full transition-all duration-500" style={{ width: `${progress}%` }} />
          </div>
        </div>

        <div className="card p-8">
          <h2 className="heading-display text-2xl text-charcoal mb-1">{STEPS[step].title}</h2>
          <p className="font-body text-charcoal/60 mb-8">{STEPS[step].subtitle}</p>

          {/* STEP 0 — FOUNDER */}
          {step === 0 && (
            <div className="space-y-5">
              <div><label className="label">Your full name *</label><input className="input" value={form.founder_full_name} onChange={e => set('founder_full_name', e.target.value)} placeholder="Maria Salazar" /></div>
              <div><label className="label">Pronouns</label><input className="input" value={form.pronouns} onChange={e => set('pronouns', e.target.value)} placeholder="she/her" /></div>
              <div><label className="label">Your personal story <span className="text-charcoal/40 font-normal">(why you started your business)</span></label>
                <textarea className="input min-h-28 resize-y" value={form.why_started_business} onChange={e => set('why_started_business', e.target.value)} placeholder="I started this business because..." /></div>
              <div><label className="label">Professional background</label>
                <textarea className="input min-h-20 resize-y" value={form.background} onChange={e => set('background', e.target.value)} placeholder="Previous experience, education, skills..." /></div>
              <div><label className="label">Tribal affiliation <span className="text-charcoal/40 font-normal">(if applicable)</span></label>
                <input className="input" value={form.tribal_affiliation} onChange={e => set('tribal_affiliation', e.target.value)} placeholder="e.g. Lakota Sioux, Cherokee Nation..." /></div>
              <div><label className="label">Community ties</label>
                <input className="input" value={form.community_ties} onChange={e => set('community_ties', e.target.value)} placeholder="Organizations, communities, networks you're part of" /></div>
            </div>
          )}

          {/* STEP 1 — BUSINESS */}
          {step === 1 && (
            <div className="space-y-5">
              <div><label className="label">Business legal name *</label><input className="input" value={form.legal_name} onChange={e => set('legal_name', e.target.value)} placeholder="Terra Home Goods LLC" /></div>
              <div><label className="label">Industry / sector</label><input className="input" value={form.industry} onChange={e => set('industry', e.target.value)} placeholder="e.g. Retail, Health & Wellness, Tech..." /></div>
              <div><label className="label">What does your business do?</label>
                <textarea className="input min-h-24 resize-y" value={form.business_description} onChange={e => set('business_description', e.target.value)} placeholder="Describe your products or services..." /></div>
              <div><label className="label">Mission statement</label>
                <textarea className="input min-h-16 resize-y" value={form.mission_statement} onChange={e => set('mission_statement', e.target.value)} placeholder="Our mission is to..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">State</label><input className="input" value={form.state} onChange={e => set('state', e.target.value)} placeholder="e.g. Alaska" /></div>
                <div><label className="label">City</label><input className="input" value={form.city} onChange={e => set('city', e.target.value)} placeholder="e.g. Anchorage" /></div>
              </div>
              <div>
                <label className="label">Revenue stage</label>
                <div className="grid grid-cols-2 gap-2 mt-1">
                  {REVENUE_STAGES.map(r => (
                    <button key={r.value} type="button" onClick={() => set('revenue_stage', r.value)}
                      className={`p-3 rounded-xl border text-left font-sans text-sm transition-colors ${form.revenue_stage === r.value ? 'border-clay-400 bg-clay-50 text-clay-700' : 'border-sand-200 text-charcoal/70 hover:border-clay-200'}`}>
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 2 — CERTIFICATIONS */}
          {step === 2 && (
            <div className="space-y-6">
              <div>
                <p className="font-sans font-medium text-sm text-charcoal mb-3">Certifications you currently hold</p>
                <div className="flex flex-wrap gap-2">
                  {CERTS.map(cert => (
                    <button key={cert} type="button" onClick={() => toggleCert(cert, 'certifications_held')}
                      className={`px-3 py-2 rounded-full border font-sans text-sm transition-colors flex items-center gap-2 ${form.certifications_held.includes(cert) ? 'bg-forest-600 text-white border-forest-600' : 'border-sand-300 text-charcoal/70 hover:border-forest-300'}`}>
                      {form.certifications_held.includes(cert) && <CheckCircle size={13} />}
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <p className="font-sans font-medium text-sm text-charcoal mb-3">Certifications you're pursuing or plan to get</p>
                <div className="flex flex-wrap gap-2">
                  {CERTS.filter(c => !form.certifications_held.includes(c)).map(cert => (
                    <button key={cert} type="button" onClick={() => toggleCert(cert, 'certifications_pending')}
                      className={`px-3 py-2 rounded-full border font-sans text-sm transition-colors ${form.certifications_pending.includes(cert) ? 'bg-clay-100 text-clay-700 border-clay-300' : 'border-sand-300 text-charcoal/70 hover:border-clay-200'}`}>
                      {cert}
                    </button>
                  ))}
                </div>
              </div>
              <p className="font-sans text-xs text-charcoal/40">Don't have certifications yet? No problem — many grants don't require them, and FoundHer will show you how to get them.</p>
            </div>
          )}

          {/* STEP 3 — IMPACT */}
          {step === 3 && (
            <div className="space-y-5">
              <div><label className="label">Who does your business serve?</label>
                <textarea className="input min-h-20 resize-y" value={form.communities_served} onChange={e => set('communities_served', e.target.value)} placeholder="Describe the communities, customers, or populations you serve..." /></div>
              <div><label className="label">Social mission</label>
                <textarea className="input min-h-20 resize-y" value={form.social_mission} onChange={e => set('social_mission', e.target.value)} placeholder="Beyond profit, what change does your business create?" /></div>
              <div><label className="label">Cultural significance <span className="text-charcoal/40 font-normal">(for Indigenous founders)</span></label>
                <textarea className="input min-h-20 resize-y" value={form.cultural_significance} onChange={e => set('cultural_significance', e.target.value)} placeholder="How does your business connect to your culture, community, or tribal identity?" /></div>
              <div><label className="label">Projected jobs to create with grant funding</label>
                <input className="input" type="number" min={0} value={form.jobs_to_create} onChange={e => set('jobs_to_create', parseInt(e.target.value))} /></div>
            </div>
          )}

          {/* STEP 4 — FUNDING */}
          {step === 4 && (
            <div className="space-y-5">
              <div><label className="label">Typical grant amount you're seeking</label>
                <input className="input" value={form.typical_amount_needed} onChange={e => set('typical_amount_needed', e.target.value)} placeholder="e.g. $10,000–$50,000" /></div>
              <div><label className="label">Primary use of funds</label>
                <textarea className="input min-h-32 resize-y" value={form.primary_use_of_funds} onChange={e => set('primary_use_of_funds', e.target.value)} placeholder="Be specific: e.g. Purchase 2 industrial sewing machines ($8,000), hire a part-time assistant ($18,000), marketing campaign ($4,000)..." /></div>
              <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
                <p className="font-sans text-sm font-medium text-forest-700 mb-1">💡 Pro tip</p>
                <p className="font-sans text-xs text-forest-600 leading-relaxed">The more specific you are about how you'll use the money, the stronger your applications will be. "Grow my business" won't win. "Purchase commercial kitchen equipment to fulfill 3 retail contracts" will.</p>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-sand-100">
            <button onClick={() => setStep(s => s - 1)} disabled={step === 0}
              className="btn-secondary disabled:opacity-30 flex items-center gap-2">
              <ArrowLeft size={16} /> Back
            </button>
            {step < STEPS.length - 1 ? (
              <button onClick={() => setStep(s => s + 1)} className="btn-primary">
                Continue <ArrowRight size={16} />
              </button>
            ) : (
              <button onClick={save} disabled={saving} className="btn-forest">
                {saving ? 'Saving...' : <><CheckCircle size={16} /> Complete Profile</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
