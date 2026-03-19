'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Search, Filter, Bookmark, BookmarkCheck, ExternalLink, X } from 'lucide-react'
import { formatCurrency, daysUntil, cn, computeMatchScore, getMatchScoreColor, getMatchScoreLabel } from '@/lib/utils'

const ELIGIBLE_FILTERS = [
  { key: 'women_owned', label: 'Women-Owned' },
  { key: 'indigenous', label: 'Indigenous / Tribal' },
  { key: 'wosb', label: 'WOSB Certified' },
  { key: 'tribal_8a', label: 'Tribal 8(a)' },
  { key: 'bipoc', label: 'BIPOC-Owned' },
  { key: 'veteran', label: 'Veteran-Owned' },
]

const TYPE_FILTERS = [
  { key: 'federal', label: 'Federal' },
  { key: 'state', label: 'State' },
  { key: 'private_foundation', label: 'Foundation' },
  { key: 'corporate', label: 'Corporate' },
  { key: 'tribal', label: 'Tribal' },
]

export default function GrantsPage() {
  const [grants, setGrants] = useState<any[]>([])
  const [saved, setSaved] = useState<Set<string>>(new Set())
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [eligFilter, setEligFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: fp } = await supabase.from('founder_profiles').select('*').eq('user_id', user.id).single()
        setProfile(fp)
        const { data: sv } = await supabase.from('saved_grants').select('grant_id').eq('user_id', user.id)
        setSaved(new Set(sv?.map(s => s.grant_id) || []))
      }
    }
    init()
  }, [])

  const fetchGrants = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('grants').select('*').eq('is_active', true)
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,grantor_organization.ilike.%${query}%`)
    if (eligFilter.length > 0) q = q.overlaps('eligible_for', eligFilter)
    if (typeFilter.length > 0) q = q.in('grantor_type', typeFilter)
    q = q.order('featured', { ascending: false }).order('max_amount', { ascending: false })
    const { data } = await q
    setGrants(data || [])
    setLoading(false)
  }, [query, eligFilter, typeFilter])

  useEffect(() => { fetchGrants() }, [fetchGrants])

  const toggleSave = async (grantId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (saved.has(grantId)) {
      await supabase.from('saved_grants').delete().eq('user_id', user.id).eq('grant_id', grantId)
      setSaved(s => { const n = new Set(s); n.delete(grantId); return n })
    } else {
      await supabase.from('saved_grants').insert({ user_id: user.id, grant_id: grantId })
      setSaved(s => new Set([...s, grantId]))
    }
  }

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="section-label mb-2">Grant Database</p>
        <h1 className="heading-display text-3xl text-charcoal">Find your grants.</h1>
        <p className="font-body text-charcoal/60 mt-2">{grants.length} grants available. Filtered for women-owned and Indigenous-owned businesses.</p>
      </div>

      {/* Search + Filter bar */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/40" />
          <input className="input pl-10" placeholder="Search grants by name, organization, or keyword..."
            value={query} onChange={e => setQuery(e.target.value)} />
        </div>
        <button onClick={() => setShowFilters(!showFilters)}
          className={cn('btn-secondary flex items-center gap-2', (eligFilter.length + typeFilter.length) > 0 && 'border-clay-400 text-clay-600')}>
          <Filter size={16} />
          Filters
          {(eligFilter.length + typeFilter.length) > 0 && (
            <span className="bg-clay-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
              {eligFilter.length + typeFilter.length}
            </span>
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="card p-6 mb-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <p className="font-sans font-medium text-sm text-charcoal mb-3">Eligibility</p>
              <div className="flex flex-wrap gap-2">
                {ELIGIBLE_FILTERS.map(f => (
                  <button key={f.key} onClick={() => toggleFilter(eligFilter, f.key, setEligFilter)}
                    className={cn('px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-colors',
                      eligFilter.includes(f.key) ? 'bg-clay-500 text-white border-clay-500' : 'border-sand-300 text-charcoal/70 hover:border-clay-300')}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="font-sans font-medium text-sm text-charcoal mb-3">Grant Type</p>
              <div className="flex flex-wrap gap-2">
                {TYPE_FILTERS.map(f => (
                  <button key={f.key} onClick={() => toggleFilter(typeFilter, f.key, setTypeFilter)}
                    className={cn('px-3 py-1.5 rounded-full font-sans text-xs font-medium border transition-colors',
                      typeFilter.includes(f.key) ? 'bg-forest-600 text-white border-forest-600' : 'border-sand-300 text-charcoal/70 hover:border-forest-300')}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          {(eligFilter.length + typeFilter.length) > 0 && (
            <button onClick={() => { setEligFilter([]); setTypeFilter([]) }}
              className="mt-4 font-sans text-xs text-clay-500 hover:text-clay-700 flex items-center gap-1">
              <X size={12} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-sand-200 rounded mb-3 w-3/4" />
              <div className="h-3 bg-sand-100 rounded mb-2 w-1/2" />
              <div className="h-6 bg-sand-200 rounded w-1/3 mt-4" />
            </div>
          ))}
        </div>
      ) : grants.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-charcoal/30 mb-2">No grants found</p>
          <p className="font-sans text-sm text-charcoal/40">Try adjusting your search or filters.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grants.map(grant => {
            const score = computeMatchScore(grant, profile)
            const isSaved = saved.has(grant.id)
            const days = grant.deadline ? daysUntil(grant.deadline) : null
            return (
              <div key={grant.id} className="card p-5 flex flex-col hover:border-clay-300 transition-all">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex flex-wrap gap-1.5">
                    {grant.eligible_for?.slice(0, 2).map((e: string) => (
                      <span key={e} className={`badge text-xs ${e.includes('indigenous') || e.includes('tribal') ? 'badge-forest' : 'badge-clay'}`}>
                        {e.replace('_', ' ')}
                      </span>
                    ))}
                  </div>
                  <button onClick={() => toggleSave(grant.id)} className="text-charcoal/30 hover:text-clay-500 transition-colors ml-2 flex-shrink-0">
                    {isSaved ? <BookmarkCheck size={18} className="text-clay-500" /> : <Bookmark size={18} />}
                  </button>
                </div>

                <h3 className="font-display font-semibold text-charcoal leading-snug mb-1 flex-1">{grant.name}</h3>
                <p className="font-sans text-xs text-charcoal/50 mb-3">{grant.grantor_organization}</p>

                {grant.description && (
                  <p className="font-body text-xs text-charcoal/60 leading-relaxed mb-4 line-clamp-2">{grant.description}</p>
                )}

                <div className="flex items-end justify-between mt-auto pt-3 border-t border-sand-100">
                  <div>
                    <p className="font-display font-bold text-xl text-clay-500">{grant.amount_display || formatCurrency(grant.max_amount)}</p>
                    {days !== null && (
                      <p className={cn('font-sans text-xs mt-0.5', days < 14 ? 'text-clay-500 font-medium' : 'text-charcoal/40')}>
                        {days > 0 ? `${days} days left` : 'Deadline passed'}
                      </p>
                    )}
                    {!grant.deadline && <p className="font-sans text-xs text-charcoal/40 mt-0.5">Rolling deadline</p>}
                  </div>
                  <div className="text-right">
                    {profile && (
                      <p className={cn('font-sans text-xs font-medium', getMatchScoreColor(score))}>
                        {getMatchScoreLabel(score)}
                      </p>
                    )}
                    <a href={grant.source_url} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 font-sans text-xs text-clay-500 hover:text-clay-700 mt-1">
                      View Grant <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
