import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { LayoutDashboard, Database, Users, Settings, LogOut } from 'lucide-react'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/signin')

  const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim())
  if (!ADMIN_EMAILS.includes(user.email || '')) redirect('/dashboard')

  return (
    <div className="min-h-screen bg-cream flex">
      <aside className="hidden md:flex flex-col w-56 bg-charcoal border-r border-white/10 fixed inset-y-0 left-0">
        <div className="p-6 border-b border-white/10">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-clay-500 rounded-full flex items-center justify-center">
              <span className="text-white font-display font-700 text-xs">F</span>
            </div>
            <span className="font-display font-600 text-white text-base">Admin</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {[
            { href: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
            { href: '/dashboard', icon: Users, label: '← User Dashboard' },
          ].map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex items-center gap-3 px-3 py-2.5 rounded-xl font-sans text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors">
              <Icon size={16} /><span>{label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10">
          <p className="font-sans text-xs text-white/30 mb-1">{user.email}</p>
          <form action="/api/auth/signout" method="POST">
            <button type="submit" className="flex items-center gap-2 text-white/30 hover:text-white/60 font-sans text-xs transition-colors">
              <LogOut size={13} /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 md:ml-56">{children}</main>
    </div>
  )
}
