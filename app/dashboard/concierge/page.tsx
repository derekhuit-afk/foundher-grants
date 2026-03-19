'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sparkles, ArrowRight, CheckCircle, Clock, FileText, Loader, Lock, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { cn, formatCurrency, daysUntil } from '@/lib/utils'

const AGENT_STEPS = [
  { key: 'intake', label: 'Intake Agent', desc: 'Loading your founder profile' },
  { key: 'research', label: 'Grant Research Agent', desc: 'Fetching grant requirements' },
  { key: 'eligibility', label: 'Eligibility Agent', desc: 'Validating your eligibility' },
  { key: 'narrative', label: 'Narrative Writing Agent', desc: 'Writing your application (2–3 min)' },
  { key: 'assembly', label: 'Package Assembly Agent', desc: 'Formatting and quality check' },
  { key: 'delivery', label: 'Delivery Agent', desc: 'Finalizing your package' },
]

export default function ConciergePage() {
  const [profile, setProfile] = useState<any>(null)
  const [grants, setGrants] = useState<any[]>([])
  const [applications, setApplications] = useState<any[]>([])
  const [selectedGrant, setSelectedGrant] = useState<string>('')
  const [activeApp, setActiveApp] = useState<string | null>(null)
  const [agentProgress, setAgentProgress] = useState<Record<string, string>>({})
  const [currentAgent, setCurrentAgent] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: g }, { data: a }] = await Promise.all([
        supabase.from('profiles').select('*, founder_profiles(*)').eq('id', user.id).single(),
        supabase.from('grants').select('*').eq('is_active', true).eq('featured', true).limit(20),
        supabase.from('applications').select('*, grants(name, max_amount, amount_display)').eq('user_id', user.id).order('created_at', { ascending: false }),
      ])
      setProfile(p); setGrants(g || []); setApplications(a || [])
    }
    init()
  }, [])

  const startApplication = async () => {
    if (!selectedGrant) return
    setLoading(true); setError(''); setAgentProgress({})

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const res = await fetch('/api/applications', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, grantId: selectedGrant }),
    })

    if (!res.ok) {
      const err = await res.json()
      setError(err.error || 'Something went wrong.'); setLoading(false); return
    }

    const { applicationId } = await res.json()
    setActiveApp(applicationId)

    // Poll for status updates
    const agents = ['intake', 'research', 'eligibility', 'narrative', 'assembly', 'delivery']
    let agentIdx = 0
    const interval = setInterval(async () => {
      if (agentIdx < agents.length) {
        setCurrentAgent(agents[agentIdx])
        setAgentProgress(p => ({ ...p, [agents[agentIdx]]: 'running' }))
        await new Promise(r => setTimeout(r, agentIdx === 3 ? 8000 : 2000))
        setAgentProgress(p => ({ ...p, [agents[agentIdx]]: 'complete' }))
        agentIdx++
      } else {
        clearInterval(interval)
        setLoading(false)
        setCurrentAgent('')
        // Refresh applications
        const { data: newApps } = await supabase
          .from('applications')
          .select('*, grants(name, max_amount, amount_display)')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
        setApplications(newApps || [])
      }
    }, 100)
  }

  const tier = profile?.subscription_tier

  if (tier !== 'tier2') {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="max-w-md text-center card p-10">
          <Lock size={40} className="text-clay-300 mx-auto mb-4" />
          <h2 className="font-display font-700 text-2xl text-charcoal mb-3">Grant Concierge is Tier 2</h2>
          <p className="font-body text-charcoal/60 mb-6 leading-relaxed">
            Upgrade to Grant Concierge and our AI writes complete, submission-ready applications for you. $199/month, 12-month minimum.
          </p>
          <Link href="/pricing" className="btn-primary w-full justify-center">Upgrade to Concierge →</Link>
          <p className="font-sans text-xs text-charcoal/30 mt-4">Avg. ROI: $18,500 per year in grants awarded</p>
        </div>
      </div>
    )
  }

  const fip = profile?.founder_profiles
  if (!fip) {
    return (
      <div className="p-8 flex items-center justify-center min-h-96">
        <div className="max-w-md text-center card p-10">
          <AlertCircle size={40} className="text-clay-400 mx-auto mb-4" />
          <h2 className="font-display font-700 text-2xl text-charcoal mb-3">Complete your profile first</h2>
          <p className="font-body text-charcoal/60 mb-6">Your founder profile is needed for the AI to write personalized applications.</p>
          <Link href="/dashboard/onboarding" className="btn-primary w-full justify-center">Complete Profile →</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="section-label mb-2">Grant Concierge</p>
        <h1 className="heading-display text-3xl text-charcoal">Your AI grant writer.</h1>
        <p className="font-body text-charcoal/60 mt-2">Select a grant below. Our AI produces your complete application — narratives, forms, package — delivered in minutes.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Grant selector */}
        <div className="card p-6">
          <h2 className="font-display font-600 text-xl text-charcoal mb-4">1. Select a Grant</h2>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {grants.map(g => (
              <div key={g.id} onClick={() => setSelectedGrant(g.id)}
                className={cn('p-4 rounded-xl border cursor-pointer transition-all',
                  selectedGrant === g.id ? 'border-clay-400 bg-clay-50' : 'border-sand-200 hover:border-clay-200')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-sans font-500 text-sm text-charcoal">{g.name}</p>
                    <p className="font-sans text-xs text-charcoal/50 mt-0.5">{g.grantor_organization}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <p className="font-display font-700 text-base text-clay-500">{g.amount_display || formatCurrency(g.max_amount)}</p>
                    {g.deadline && <p className="font-sans text-xs text-charcoal/40">{daysUntil(g.deadline)}d left</p>}
                  </div>
                </div>
                {selectedGrant === g.id && <CheckCircle size={14} className="text-clay-500 mt-2" />}
              </div>
            ))}
          </div>
        </div>

        {/* Launch panel */}
        <div className="card p-6 flex flex-col">
          <h2 className="font-display font-600 text-xl text-charcoal mb-4">2. Generate Application</h2>

          {!loading && !activeApp && (
            <>
              <div className="flex-1 bg-clay-50 rounded-xl p-5 mb-5">
                <p className="font-sans text-sm font-500 text-charcoal mb-3">What the AI will produce:</p>
                {['Executive Summary','Mission Alignment Statement','Founder Biography','Use of Funds Narrative','Organizational Capacity Statement','Community Impact Statement','Cover Letter'].map(s => (
                  <div key={s} className="flex items-center gap-2 mb-2">
                    <CheckCircle size={13} className="text-forest-500" />
                    <span className="font-sans text-xs text-charcoal/70">{s}</span>
                  </div>
                ))}
              </div>
              <button onClick={startApplication} disabled={!selectedGrant}
                className={cn('btn-primary w-full justify-center', !selectedGrant && 'opacity-40 cursor-not-allowed')}>
                <Sparkles size={18} /> Generate My Application
              </button>
              {error && <p className="font-sans text-sm text-clay-600 mt-3 text-center">{error}</p>}
            </>
          )}

          {loading && (
            <div className="flex-1 space-y-3">
              {AGENT_STEPS.map(step => {
                const status = agentProgress[step.key]
                return (
                  <div key={step.key} className={cn('flex items-center gap-3 p-3 rounded-xl transition-all',
                    status === 'running' ? 'bg-clay-50 border border-clay-200' : status === 'complete' ? 'bg-forest-50' : 'opacity-30')}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0">
                      {status === 'complete' ? <CheckCircle size={18} className="text-forest-500" />
                        : status === 'running' ? <Loader size={18} className="text-clay-500 animate-spin" />
                        : <div className="w-3 h-3 rounded-full bg-sand-300" />}
                    </div>
                    <div>
                      <p className="font-sans text-xs font-500 text-charcoal">{step.label}</p>
                      <p className="font-sans text-xs text-charcoal/40">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Previous applications */}
      {applications.length > 0 && (
        <div>
          <h2 className="font-display font-600 text-xl text-charcoal mb-4">Your Applications</h2>
          <div className="space-y-3">
            {applications.map(app => (
              <div key={app.id} className="card p-5 flex items-center justify-between">
                <div>
                  <p className="font-sans font-500 text-sm text-charcoal">{app.grants?.name}</p>
                  <p className="font-sans text-xs text-charcoal/50 mt-0.5 capitalize">{app.status.replace(/_/g, ' ')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={cn('badge', app.status === 'package_ready' || app.status === 'delivered' ? 'badge-forest' : 'badge-sand')}>
                    {app.status === 'package_ready' ? 'Ready to Submit' : app.status === 'awarded' ? 'Awarded!' : app.status.replace(/_/g, ' ')}
                  </span>
                  {app.package_complete && (
                    <Link href={`/dashboard/applications/${app.id}`} className="btn-secondary text-xs py-1.5 px-3">
                      View Package →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
