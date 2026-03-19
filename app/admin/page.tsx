export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Users, Database, FileText, TrendingUp, DollarSign } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'
import AdminGrantForm from './grant-form'

export default async function AdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  // Simple admin check - email based
  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  if (!ADMIN_EMAILS.includes(user.email || '')) redirect('/dashboard')

  const [
    { count: userCount },
    { count: tier1Count },
    { count: tier2Count },
    { count: grantCount },
    { count: appCount },
    { data: recentUsers },
    { data: recentApps },
  ] = await Promise.all([
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'tier1'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('subscription_tier', 'tier2'),
    supabase.from('grants').select('*', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('applications').select('*', { count: 'exact', head: true }),
    supabase.from('profiles').select('*').order('created_at', { ascending: false }).limit(10),
    supabase.from('applications').select('*, profiles(full_name, email), grants(name)').order('created_at', { ascending: false }).limit(10),
  ])

  const mrr = ((tier1Count || 0) * 29) + ((tier2Count || 0) * 199)

  return (
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <p className="section-label mb-2">Admin</p>
          <h1 className="heading-display text-3xl text-charcoal">FoundHer Command Center</h1>
        </div>
        <span className="badge badge-clay">Admin Access</span>
      </div>

      {/* MRR + KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-10">
        {[
          { label: 'MRR', value: formatCurrency(mrr), icon: DollarSign, color: 'text-forest-600' },
          { label: 'Total Users', value: userCount || 0, icon: Users, color: 'text-charcoal' },
          { label: 'Tier 1', value: tier1Count || 0, icon: TrendingUp, color: 'text-sand-600' },
          { label: 'Tier 2', value: tier2Count || 0, icon: TrendingUp, color: 'text-clay-500' },
          { label: 'Applications', value: appCount || 0, icon: FileText, color: 'text-forest-500' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <s.icon size={18} className={`${s.color} mb-2`} />
            <p className="font-display font-bold text-2xl text-charcoal">{s.value}</p>
            <p className="font-sans text-xs text-charcoal/50 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-10">
        {/* Recent signups */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Recent Signups</h2>
          <div className="space-y-3">
            {recentUsers?.map(u => (
              <div key={u.id} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                <div>
                  <p className="font-sans text-sm text-charcoal">{u.full_name || 'Unnamed'}</p>
                  <p className="font-sans text-xs text-charcoal/40">{u.email}</p>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs ${u.subscription_tier === 'tier2' ? 'badge-clay' : u.subscription_tier === 'tier1' ? 'badge-forest' : 'badge-sand'}`}>
                    {u.subscription_tier || 'free'}
                  </span>
                  <p className="font-sans text-xs text-charcoal/30 mt-1">{formatDate(u.created_at)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent applications */}
        <div className="card p-6">
          <h2 className="font-display font-semibold text-lg text-charcoal mb-4">Recent Applications</h2>
          <div className="space-y-3">
            {recentApps?.map((a: any) => (
              <div key={a.id} className="flex items-center justify-between py-2 border-b border-sand-100 last:border-0">
                <div>
                  <p className="font-sans text-sm text-charcoal">{a.grants?.name}</p>
                  <p className="font-sans text-xs text-charcoal/40">{a.profiles?.full_name}</p>
                </div>
                <div className="text-right">
                  <span className={`badge text-xs ${a.status === 'package_ready' ? 'badge-forest' : 'badge-sand'}`}>
                    {a.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Add Grant form */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-6">
          <Database size={18} className="text-clay-500" />
          <h2 className="font-display font-semibold text-lg text-charcoal">Add Grant to Database</h2>
          <span className="font-sans text-xs text-charcoal/40">({grantCount} active grants)</span>
        </div>
        <AdminGrantForm />
      </div>
    </div>
  )
}
