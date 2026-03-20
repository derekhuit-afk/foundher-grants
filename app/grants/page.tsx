'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { Search, Filter, ExternalLink, X, Lock, ArrowRight, Clock } from 'lucide-react'
import { formatCurrency, daysUntil, cn } from '@/lib/utils'

const VISIBLE_LIMIT = 12

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

export default function PublicGrantsPage() {
  const [grants, setGrants] = useState<any[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [eligFilter, setEligFilter] = useState<string[]>([])
  const [typeFilter, setTypeFilter] = useState<string[]>([])
  const [showFilters, setShowFilters] = useState(false)

  const supabase = createClient()

  const fetchGrants = useCallback(async () => {
    setLoading(true)
    let q = supabase.from('grants').select('*', { count: 'exact' }).eq('is_active', true)
    if (query) q = q.or(`name.ilike.%${query}%,description.ilike.%${query}%,grantor_organization.ilike.%${query}%`)
    if (eligFilter.length > 0) q = q.overlaps('eligible_for', eligFilter)
    if (typeFilter.length > 0) q = q.in('grantor_type', typeFilter)
    q = q.order('featured', { ascending: false }).order('max_amount', { ascending: false }).limit(VISIBLE_LIMIT + 6)
    const { data, count } = await q
    setGrants(data || [])
    setTotalCount(count || 0)
    setLoading(false)
  }, [query, eligFilter, typeFilter])

  useEffect(() => { fetchGrants() }, [fetchGrants])

  const toggleFilter = (arr: string[], val: string, setter: (v: string[]) => void) => {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val])
  }

  const visibleGrants = grants.slice(0, VISIBLE_LIMIT)
  const blurredGrants = grants.slice(VISIBLE_LIMIT)
  const hiddenCount = Math.max(0, totalCount - VISIBLE_LIMIT)

  return (
    <main className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-24 pb-16 max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="mb-10">
          <p className="section-label mb-2">Grant Database</p>
          <h1 className="heading-display text-4xl md:text-5xl text-charcoal mb-3">Browse grants.</h1>
          <p className="font-body text-lg text-charcoal/60 max-w-2xl">
            Explore our curated database of grants for women-owned, Indigenous-owned, and underrepresented founders. 
            Sign up free to unlock match scores, saved grants, and deadline alerts.
          </p>
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

        {/* Count */}
        {!loading && (
          <p className="font-sans text-sm text-charcoal/50 mb-6">
            Showing {visibleGrants.length} of {totalCount} grants
            {hiddenCount > 0 && <span> · <Link href="/auth/signup" className="text-clay-500 hover:text-clay-700 font-medium">Sign up free</Link> to see all {totalCount}</span>}
          </p>
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
          <>
            {/* Visible grants */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {visibleGrants.map(grant => {
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
                      <span className="font-sans text-xs text-charcoal/40">{grant.grantor_type?.replace('_', ' ')}</span>
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
                          <p className={cn('font-sans text-xs mt-0.5 flex items-center gap-1', days < 14 ? 'text-clay-500 font-medium' : 'text-charcoal/40')}>
                            <Clock size={10} />
                            {days > 0 ? `${days} days left` : 'Deadline passed'}
                          </p>
                        )}
                        {!grant.deadline && <p className="font-sans text-xs text-charcoal/40 mt-0.5 flex items-center gap-1"><Clock size={10} /> Rolling deadline</p>}
                      </div>
                      <div className="text-right">
                        <span className="font-sans text-xs text-charcoal/30 flex items-center gap-1">
                          <Lock size={10} /> Match score
                        </span>
                        {grant.source_url && (
                          <a href={grant.source_url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 font-sans text-xs text-clay-500 hover:text-clay-700 mt-1">
                            View Grant <ExternalLink size={11} />
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Blurred overflow grants + CTA */}
            {hiddenCount > 0 && (
              <div className="relative mt-4">
                {/* Show a few blurred cards */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 pointer-events-none select-none" style={{ filter: 'blur(6px)', opacity: 0.5 }}>
                  {blurredGrants.slice(0, 3).map((grant, i) => (
                    <div key={i} className="card p-5">
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {grant.eligible_for?.slice(0, 2).map((e: string) => (
                          <span key={e} className={`badge text-xs ${e.includes('indigenous') || e.includes('tribal') ? 'badge-forest' : 'badge-clay'}`}>
                            {e.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                      <h3 className="font-display font-semibold text-charcoal leading-snug mb-1">{grant.name}</h3>
                      <p className="font-sans text-xs text-charcoal/50 mb-3">{grant.grantor_organization}</p>
                      <p className="font-display font-bold text-xl text-clay-500 mt-3">{grant.amount_display || formatCurrency(grant.max_amount)}</p>
                    </div>
                  ))}
                </div>

                {/* Overlay CTA */}
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-t from-cream via-cream/90 to-transparent rounded-2xl">
                  <div className="text-center px-6">
                    <div className="inline-flex items-center gap-2 bg-clay-100 text-clay-600 font-sans text-sm font-medium px-4 py-2 rounded-full mb-4">
                      <Lock size={14} />
                      {hiddenCount}+ more grants available
                    </div>
                    <h3 className="font-display font-semibold text-2xl text-charcoal mb-3">Create a free account to see every grant.</h3>
                    <p className="font-body text-charcoal/60 mb-6 max-w-md mx-auto">
                      Get personalized match scores, save your favorites, set up deadline alerts, and access our full database of {totalCount}+ verified grants.
                    </p>
                    <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
                      Sign Up Free <ArrowRight size={18} />
                    </Link>
                    <p className="font-sans text-xs text-charcoal/40 mt-3">No credit card required</p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
      <Footer />
    </main>
  )
}
