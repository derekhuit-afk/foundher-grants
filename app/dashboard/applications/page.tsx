import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { FileText, ArrowRight, Sparkles } from 'lucide-react'
import { formatCurrency, formatDate, cn } from '@/lib/utils'

const STATUS_COLORS: Record<string, string> = {
  intake_pending: 'badge-sand',
  intake_complete: 'badge-sand',
  eligibility_validated: 'badge-sand',
  narrative_draft: 'badge-clay',
  package_ready: 'badge-forest',
  delivered: 'badge-forest',
  submitted: 'badge-forest',
  awarded: 'bg-forest-600 text-white',
  declined: 'bg-charcoal/10 text-charcoal/50',
}

export default async function ApplicationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase.from('profiles').select('subscription_tier').eq('id', user.id).single()
  const { data: apps } = await supabase
    .from('applications')
    .select('*, grants(name, max_amount, amount_display, grantor_organization)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const tier = profile?.subscription_tier

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <p className="section-label mb-2">Applications</p>
          <h1 className="heading-display text-3xl text-charcoal">Your application pipeline.</h1>
        </div>
        {tier === 'tier2' && (
          <Link href="/dashboard/concierge" className="btn-primary flex items-center gap-2">
            <Sparkles size={16} /> New Application
          </Link>
        )}
      </div>

      {tier !== 'tier2' ? (
        <div className="card p-12 text-center">
          <Sparkles size={40} className="text-clay-300 mx-auto mb-4" />
          <h2 className="font-display font-semibold text-2xl text-charcoal mb-3">Grant Concierge writes your applications</h2>
          <p className="font-body text-charcoal/60 mb-6 max-w-md mx-auto leading-relaxed">
            Upgrade to Tier 2 and our AI produces complete, submission-ready grant applications for you. Up to 5 per month.
          </p>
          <Link href="/pricing" className="btn-primary">Upgrade to Concierge →</Link>
          <p className="font-sans text-xs text-charcoal/30 mt-4">$199/month · 12-month minimum · avg. $18,500 ROI</p>
        </div>
      ) : apps?.length === 0 ? (
        <div className="card p-12 text-center">
          <FileText size={40} className="text-sand-300 mx-auto mb-4" />
          <p className="font-display text-2xl text-charcoal/40 mb-2">No applications yet</p>
          <p className="font-sans text-sm text-charcoal/40 mb-6">Use Grant Concierge to generate your first application.</p>
          <Link href="/dashboard/concierge" className="btn-primary">Open Grant Concierge →</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {apps?.map(app => (
            <div key={app.id} className="card p-6 flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <p className="font-sans font-medium text-charcoal truncate">{app.grants?.name}</p>
                  <span className={`badge flex-shrink-0 ${STATUS_COLORS[app.status] || 'badge-sand'}`}>
                    {app.status === 'awarded' ? '🎉 Awarded' : app.status.replace(/_/g, ' ')}
                  </span>
                </div>
                <p className="font-sans text-xs text-charcoal/50">{app.grants?.grantor_organization}</p>
                <p className="font-sans text-xs text-charcoal/30 mt-1">Started {formatDate(app.created_at)}</p>
              </div>
              <div className="flex items-center gap-4 flex-shrink-0">
                {app.grants?.max_amount && (
                  <p className="font-display font-bold text-lg text-clay-500">
                    {app.grants?.amount_display || formatCurrency(app.grants?.max_amount)}
                  </p>
                )}
                {app.package_complete && (
                  <Link href={`/dashboard/applications/${app.id}`}
                    className="btn-secondary text-sm py-2 px-4 flex items-center gap-1">
                    View Package <ArrowRight size={14} />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
