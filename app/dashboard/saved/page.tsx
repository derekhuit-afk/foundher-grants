export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Bookmark, ExternalLink, Clock, Trash2 } from 'lucide-react'
import { formatCurrency, daysUntil, formatDate, cn } from '@/lib/utils'
import SavedGrantActions from './actions'

export default async function SavedGrantsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: saved } = await supabase
    .from('saved_grants')
    .select('*, grants(*)')
    .eq('user_id', user.id)
    .order('saved_at', { ascending: false })

  const byStatus = {
    saved: saved?.filter(s => s.status === 'saved') || [],
    applied: saved?.filter(s => s.status === 'applied') || [],
    won: saved?.filter(s => s.status === 'won') || [],
    declined: saved?.filter(s => s.status === 'declined') || [],
  }

  const totalPotential = saved?.reduce((sum, s) => sum + (s.grants?.max_amount || 0), 0) || 0

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="section-label mb-2">Saved Grants</p>
        <h1 className="heading-display text-3xl text-charcoal">Your grant pipeline.</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Total Saved', value: saved?.length || 0, color: 'text-clay-500' },
          { label: 'Applied', value: byStatus.applied.length, color: 'text-sand-600' },
          { label: 'Won', value: byStatus.won.length, color: 'text-forest-600' },
          { label: 'Potential Value', value: `$${Math.round(totalPotential / 1000)}K+`, color: 'text-charcoal' },
        ].map(s => (
          <div key={s.label} className="card p-5 text-center">
            <p className={`font-display font-bold text-3xl mb-1 ${s.color}`}>{s.value}</p>
            <p className="font-sans text-xs text-charcoal/50">{s.label}</p>
          </div>
        ))}
      </div>

      {saved?.length === 0 ? (
        <div className="card p-16 text-center">
          <Bookmark size={40} className="text-sand-300 mx-auto mb-4" />
          <p className="font-display text-2xl text-charcoal/40 mb-2">No saved grants yet</p>
          <p className="font-sans text-sm text-charcoal/40 mb-6">Browse the grant database and bookmark ones you want to pursue.</p>
          <Link href="/dashboard/grants" className="btn-primary">Browse Grants →</Link>
        </div>
      ) : (
        <div className="space-y-10">
          {Object.entries(byStatus).map(([status, grants]) => grants.length > 0 && (
            <div key={status}>
              <h2 className="font-display font-semibold text-xl text-charcoal mb-4 capitalize flex items-center gap-3">
                {status}
                <span className="font-sans text-sm font-normal text-charcoal/40">{grants.length} grant{grants.length !== 1 ? 's' : ''}</span>
              </h2>
              <div className="space-y-3">
                {grants.map(s => {
                  const days = s.grants?.deadline ? daysUntil(s.grants.deadline) : null
                  return (
                    <div key={s.id} className={cn('card p-5 flex items-center justify-between gap-4',
                      s.status === 'won' && 'border-forest-200 bg-forest-50/30')}>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-sans font-medium text-charcoal truncate">{s.grants?.name}</p>
                          {s.status === 'won' && <span className="badge badge-forest flex-shrink-0">🎉 Won</span>}
                        </div>
                        <p className="font-sans text-xs text-charcoal/50">{s.grants?.grantor_organization}</p>
                        {days !== null && days > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <Clock size={11} className={days < 7 ? 'text-clay-500' : 'text-charcoal/30'} />
                            <span className={`font-sans text-xs ${days < 7 ? 'text-clay-600 font-medium' : 'text-charcoal/40'}`}>
                              {days} days left · {formatDate(s.grants?.deadline)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <p className="font-display font-bold text-lg text-clay-500">
                          {s.grants?.amount_display || formatCurrency(s.grants?.max_amount)}
                        </p>
                        {s.grants?.source_url && (
                          <a href={s.grants.source_url} target="_blank" rel="noopener noreferrer"
                            className="text-charcoal/30 hover:text-clay-500 transition-colors">
                            <ExternalLink size={16} />
                          </a>
                        )}
                        <SavedGrantActions savedId={s.id} currentStatus={s.status} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
