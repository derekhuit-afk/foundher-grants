import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowRight, Bookmark, FileText, Sparkles, TrendingUp, Clock, CheckCircle } from 'lucide-react'
import { formatCurrency, daysUntil, formatDate } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const [{ data: profile }, { data: savedGrants }, { data: applications }, { data: topGrants }] = await Promise.all([
    supabase.from('profiles').select('*, founder_profiles(*)').eq('id', user.id).single(),
    supabase.from('saved_grants').select('*, grants(*)').eq('user_id', user.id).order('saved_at', { ascending: false }).limit(5),
    supabase.from('applications').select('*, grants(name, max_amount)').eq('user_id', user.id).limit(3),
    supabase.from('grants').select('*').eq('is_active', true).eq('featured', true).limit(4),
  ])

  const fip = (profile as any)?.founder_profiles
  const tier = profile?.subscription_tier || 'free'
  const firstName = profile?.full_name?.split(' ')[0] || 'Founder'

  // Upcoming deadlines from saved grants
  const upcoming = (savedGrants || [])
    .filter(s => s.grants?.deadline)
    .sort((a, b) => new Date(a.grants.deadline).getTime() - new Date(b.grants.deadline).getTime())
    .slice(0, 3)

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-10">
        <p className="section-label mb-2">Dashboard</p>
        <h1 className="heading-display text-3xl text-charcoal">Good morning, {firstName}.</h1>
        {!fip && (
          <div className="mt-4 bg-clay-50 border border-clay-200 rounded-2xl p-4 flex items-center justify-between">
            <div>
              <p className="font-sans font-500 text-clay-700 text-sm">Complete your founder profile</p>
              <p className="font-sans text-xs text-clay-500 mt-0.5">Your profile unlocks personalized grant matches and match scores.</p>
            </div>
            <Link href="/dashboard/onboarding" className="btn-primary text-sm py-2 px-4 flex-shrink-0">Complete Profile →</Link>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {[
          { label: 'Grants Saved', value: savedGrants?.length || 0, icon: Bookmark, color: 'text-clay-500' },
          { label: 'Applications', value: applications?.length || 0, icon: FileText, color: 'text-forest-500' },
          { label: 'Available Grants', value: '300+', icon: TrendingUp, color: 'text-sand-600' },
          { label: 'Upcoming Deadlines', value: upcoming.length, icon: Clock, color: 'text-clay-400' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <s.icon size={20} className={`${s.color} mb-3`} />
            <p className="font-display font-700 text-3xl text-charcoal">{s.value}</p>
            <p className="font-sans text-xs text-charcoal/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Featured grants */}
        <div className="md:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-600 text-xl text-charcoal">Featured Grants</h2>
            <Link href="/dashboard/grants" className="font-sans text-sm text-clay-500 hover:text-clay-700 flex items-center gap-1">
              Browse all <ArrowRight size={14} />
            </Link>
          </div>
          <div className="space-y-3">
            {(topGrants || []).map(grant => (
              <Link key={grant.id} href={`/dashboard/grants/${grant.id}`}
                className="card p-5 flex items-center justify-between hover:border-clay-300 cursor-pointer block">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`badge ${grant.eligible_for?.includes('indigenous') ? 'badge-forest' : 'badge-clay'}`}>
                      {grant.eligible_for?.includes('indigenous') ? 'Indigenous' : 'Women-Owned'}
                    </span>
                    <span className="font-sans text-xs text-charcoal/40">{grant.grantor_type}</span>
                  </div>
                  <p className="font-sans font-500 text-charcoal text-sm">{grant.name}</p>
                  <p className="font-sans text-xs text-charcoal/50 mt-0.5">{grant.grantor_organization}</p>
                </div>
                <div className="text-right flex-shrink-0 ml-4">
                  <p className="font-display font-700 text-lg text-clay-500">{grant.amount_display || formatCurrency(grant.max_amount)}</p>
                  {grant.deadline && (
                    <p className="font-sans text-xs text-charcoal/40 mt-0.5">
                      {daysUntil(grant.deadline) > 0 ? `${daysUntil(grant.deadline)} days left` : 'Closed'}
                    </p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column */}
        <div className="space-y-6">
          {/* Upcoming deadlines */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-display font-600 text-xl text-charcoal mb-4">Deadlines</h2>
              <div className="space-y-3">
                {upcoming.map(s => (
                  <div key={s.id} className="card p-4">
                    <p className="font-sans text-sm font-500 text-charcoal leading-snug mb-1">{s.grants?.name}</p>
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-clay-400" />
                      <span className="font-sans text-xs text-clay-600 font-500">
                        {daysUntil(s.grants?.deadline)} days left — {formatDate(s.grants?.deadline)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upgrade CTA for non-tier2 */}
          {tier !== 'tier2' && (
            <div className="bg-gradient-to-br from-clay-500 to-clay-700 rounded-2xl p-6 text-white">
              <Sparkles size={24} className="mb-3 text-clay-200" />
              <h3 className="font-display font-600 text-lg mb-2">Let AI write your applications</h3>
              <p className="font-sans text-xs text-white/70 mb-4 leading-relaxed">
                Upgrade to Grant Concierge and our AI produces complete, submission-ready applications for you.
              </p>
              <Link href="/pricing" className="inline-flex items-center gap-2 bg-white text-clay-600 font-sans font-500 text-sm px-4 py-2 rounded-full hover:bg-cream transition-colors">
                Upgrade Now <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
