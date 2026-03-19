import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cream flex">
      {/* Left — branding panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-charcoal flex-col justify-between p-12">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-clay-500 rounded-full flex items-center justify-center">
            <span className="text-white font-display font-700 text-sm">F</span>
          </div>
          <span className="font-display font-600 text-white text-lg">FoundHer <span className="text-clay-400">Grants</span></span>
        </Link>
        <div>
          <p className="font-display font-600 text-white/20 text-8xl mb-6">"</p>
          <blockquote className="font-display italic text-white text-2xl leading-relaxed mb-6">
            Women-owned and Indigenous businesses are among the most grant-eligible founders in the country. The only problem is finding the right ones.
          </blockquote>
          <div className="flex gap-3 mt-8">
            {['$10K Amber Grant','$75K FNDI','$20K Fearless Strivers','$800K HUD ICDBG'].map(g => (
              <span key={g} className="font-sans text-xs text-white/40 bg-white/5 px-3 py-1.5 rounded-full">{g}</span>
            ))}
          </div>
        </div>
        <p className="font-sans text-xs text-white/20">300+ verified grants. Built for founders like you.</p>
      </div>

      {/* Right — form panel */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-7 h-7 bg-clay-500 rounded-full flex items-center justify-center">
                <span className="text-white font-display font-700 text-xs">F</span>
              </div>
              <span className="font-display font-600 text-charcoal">FoundHer Grants</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  )
}
