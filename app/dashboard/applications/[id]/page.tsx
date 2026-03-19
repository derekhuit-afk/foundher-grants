export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import { CheckCircle, AlertCircle, Download, ExternalLink } from 'lucide-react'

export default async function ApplicationPage({ params }: { params: { id: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: app } = await supabase
    .from('applications')
    .select('*, grants(*)')
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!app) notFound()

  return (
    <div className="p-8 max-w-4xl">
      <div className="mb-8">
        <p className="section-label mb-2">Application Package</p>
        <h1 className="heading-display text-3xl text-charcoal">{app.grants?.name}</h1>
        <div className="flex items-center gap-3 mt-3">
          <span className={`badge ${app.qc_passed ? 'badge-forest' : 'badge-sand'}`}>
            {app.qc_passed ? '✓ QC Passed' : 'Processing'}
          </span>
          <span className="badge badge-clay capitalize">{app.status.replace(/_/g, ' ')}</span>
        </div>
      </div>

      {/* Eligibility report */}
      {app.eligibility_report && (
        <div className="card p-5 mb-6 border-l-4 border-l-forest-400">
          <div className="flex items-start gap-3">
            <CheckCircle size={18} className="text-forest-500 mt-0.5" />
            <div>
              <p className="font-sans font-medium text-sm text-charcoal mb-1">Eligibility Validation</p>
              <p className="font-sans text-xs text-charcoal/60 whitespace-pre-line">{app.eligibility_report.report}</p>
            </div>
          </div>
        </div>
      )}

      {/* Missing info */}
      {app.missing_info?.length > 0 && (
        <div className="card p-5 mb-6 border-l-4 border-l-clay-400">
          <div className="flex items-start gap-3">
            <AlertCircle size={18} className="text-clay-500 mt-0.5" />
            <div>
              <p className="font-sans font-medium text-sm text-charcoal mb-2">Information Needed From You</p>
              {app.missing_info.map((item: string, i: number) => (
                <p key={i} className="font-sans text-xs text-charcoal/60 mb-1">• {item}</p>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Application package */}
      {app.narrative_draft && (
        <div className="card p-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-semibold text-xl text-charcoal">Complete Application Package</h2>
            <div className="flex gap-2">
              {app.grants?.application_url && (
                <a href={app.grants.application_url} target="_blank" rel="noopener noreferrer"
                  className="btn-secondary text-sm py-2 px-4 flex items-center gap-2">
                  <ExternalLink size={14} /> Submit Here
                </a>
              )}
            </div>
          </div>
          <div className="prose-foundher">
            <pre className="whitespace-pre-wrap font-body text-sm text-charcoal/80 leading-relaxed">
              {app.narrative_draft}
            </pre>
          </div>
        </div>
      )}

      {!app.narrative_draft && (
        <div className="card p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-clay-100 flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-5 h-5 rounded-full bg-clay-300" />
          </div>
          <p className="font-sans font-medium text-charcoal mb-1">Generating your application...</p>
          <p className="font-sans text-sm text-charcoal/50">This takes 2–3 minutes. Refresh to check progress.</p>
        </div>
      )}
    </div>
  )
}
