'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export default function Nav({ transparent = false }: { transparent?: boolean }) {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
      scrolled || !transparent ? 'bg-cream/95 backdrop-blur-sm border-b border-sand-200 shadow-sm' : 'bg-transparent'
    )}>
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-clay-500 rounded-full flex items-center justify-center">
            <span className="text-white font-display font-700 text-sm">F</span>
          </div>
          <span className="font-display font-600 text-charcoal text-lg">FoundHer <span className="text-clay-500">Grants</span></span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/grants" className="font-sans text-sm text-charcoal/70 hover:text-clay-500 transition-colors">Browse Grants</Link>
          <Link href="/pricing" className="font-sans text-sm text-charcoal/70 hover:text-clay-500 transition-colors">Pricing</Link>
          <Link href="/auth/signin" className="font-sans text-sm text-charcoal/70 hover:text-clay-500 transition-colors">Sign In</Link>
          <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5">Start Free →</Link>
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden p-2" onClick={() => setOpen(!open)}>
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-cream border-t border-sand-200 px-6 py-4 space-y-4">
          <Link href="/grants" className="block font-sans text-sm text-charcoal/70" onClick={() => setOpen(false)}>Browse Grants</Link>
          <Link href="/pricing" className="block font-sans text-sm text-charcoal/70" onClick={() => setOpen(false)}>Pricing</Link>
          <Link href="/auth/signin" className="block font-sans text-sm text-charcoal/70" onClick={() => setOpen(false)}>Sign In</Link>
          <Link href="/auth/signup" className="btn-primary text-sm py-2 px-5 w-full text-center" onClick={() => setOpen(false)}>Start Free →</Link>
        </div>
      )}
    </nav>
  )
}
