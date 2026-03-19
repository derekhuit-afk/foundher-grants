import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white/70">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-clay-500 rounded-full flex items-center justify-center">
                <span className="text-white font-display font-700 text-sm">F</span>
              </div>
              <span className="font-display font-600 text-white text-lg">FoundHer <span className="text-clay-400">Grants</span></span>
            </div>
            <p className="font-body text-sm leading-relaxed max-w-xs">
              The only grant platform built exclusively for women-owned and Indigenous-owned businesses. Your funding exists. We help you find it.
            </p>
            <div className="mt-6 flex gap-4">
              <a href="https://instagram.com" className="text-white/40 hover:text-clay-400 transition-colors text-sm font-sans">Instagram</a>
              <a href="https://linkedin.com" className="text-white/40 hover:text-clay-400 transition-colors text-sm font-sans">LinkedIn</a>
              <a href="https://tiktok.com" className="text-white/40 hover:text-clay-400 transition-colors text-sm font-sans">TikTok</a>
            </div>
          </div>
          <div>
            <p className="font-sans font-500 text-white text-sm mb-4">Platform</p>
            <ul className="space-y-2">
              {[['Browse Grants','/grants'],['Pricing','/pricing'],['Grant Concierge','/concierge'],['Dashboard','/dashboard']].map(([label,href]) => (
                <li key={href}><Link href={href} className="font-sans text-sm hover:text-clay-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-sans font-500 text-white text-sm mb-4">Resources</p>
            <ul className="space-y-2">
              {[['WOSB Certification Guide','#'],['8(a) Program Guide','#'],['Grant Writing Tips','#'],['Contact','#']].map(([label,href]) => (
                <li key={label}><Link href={href} className="font-sans text-sm hover:text-clay-400 transition-colors">{label}</Link></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="font-sans text-xs text-white/30">© {new Date().getFullYear()} FoundHer Grants. All rights reserved.</p>
          <div className="flex gap-6">
            <Link href="/privacy" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="font-sans text-xs text-white/30 hover:text-white/60 transition-colors">Terms of Service</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
