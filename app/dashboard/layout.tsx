export const dynamic = 'force-dynamic'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { LayoutDashboard, Search, Bookmark, FileText, Sparkles, Settings, LogOut, ChevronRight } from 'lucide-react'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { href: '/dashboard/grants', icon: Search, label: 'Find Grants' },
  { href: '/dashboard/saved', icon: Bookmark, label: 'Saved Grants' },
  { href: '/dashboard/applications', icon: FileText, label: 'Applications' },
  { href: '/dashboard/concierge', icon: Sparkles, label: 'Grant Concierge', tier2: true },
  { href: '/dashboard/settings', icon: Settings, label: 'Settings' },
]

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  const tier = profile?.subscription_tier || 'free'

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-charcoal border-r border-white/10 fixed inset-y-0 left-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-clay-500 rounded-full flex items-center justify-center">
              <span className="text-white font-display font-bold text-xs">F</span>
            </div>
            <span className="font-display font-semibold text-white text-base">FoundHer</span>
          </Link>
        </div>

        {/* Tier badge */}
        <div className="mx-4 mt-4 p-3 rounded-xl bg-white/5 border border-white/10">
          <p className="font-sans text-xs text-white/40 mb-1">Current Plan</p>
          <div className="flex items-center justify-between">
            <span className="font-sans font-medium text-sm text-white capitalize">
              {tier === 'free' ? 'Free' : tier === 'tier1' ? 'Database' : 'Concierge'}
            </span>
            {tier !== 'tier2' && (
              <Link href="/pricing" className="font-sans text-xs text-clay-400 hover:text-clay-300">Upgrade →</Link>
            )}
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 mt-2">
          {NAV.map(({ href, icon: Icon, label, tier2 }) => (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm transition-colors
                ${tier2 && tier !== 'tier2' ? 'text-white/30' : 'text-white/60 hover:text-white hover:bg-white/5'}`}>
              <Icon size={16} />
              <span>{label}</span>
              {tier2 && tier !== 'tier2' && <span className="ml-auto badge bg-clay-800 text-clay-400 text-xs">Pro</span>}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-clay-500 flex items-center justify-center">
              <span className="text-white font-sans font-medium text-sm">
                {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
              </span>
            </div>
            <div className="min-w-0">
              <p className="font-sans text-sm text-white truncate">{profile?.full_name || 'Founder'}</p>
              <p className="font-sans text-xs text-white/30 truncate">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-white/30 hover:text-white/60 font-sans text-xs w-full transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:ml-60 min-h-screen">
        {children}
      </main>
    </div>
  )
}
