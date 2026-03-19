import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { ArrowRight, Search, FileText, Award, CheckCircle, Star, TrendingUp, Users, Clock } from 'lucide-react'

const STATS = [
  { value: '$4.2B+', label: 'In grants tracked annually' },
  { value: '300+', label: 'Curated, verified grants' },
  { value: '2%', label: 'Of VC goes to women — grants change this' },
  { value: '94%', label: 'Eligibility match accuracy' },
]

const FEATURED_GRANTS = [
  { name: 'Amber Grant for Women', amount: '$10,000', deadline: 'Monthly', type: 'Private Foundation', tag: 'Women-Owned' },
  { name: 'Fearless Strivers Grant', amount: '$20,000', deadline: 'Oct 15', type: 'Corporate', tag: 'Women + BIPOC' },
  { name: 'Native American Agriculture Fund', amount: 'Up to $100,000', deadline: 'Sep 30', type: 'Foundation', tag: 'Indigenous' },
  { name: 'First Nations Development Institute', amount: 'Up to $75,000', deadline: 'Aug 31', type: 'Foundation', tag: 'Indigenous' },
  { name: 'IFundWomen Universal Grant', amount: 'Up to $50,000', deadline: 'Rolling', type: 'Foundation', tag: 'Women-Owned' },
  { name: 'HUD Indian Community Development', amount: 'Up to $800,000', deadline: 'Aug 15', type: 'Federal', tag: 'Indigenous' },
]

const HOW_IT_WORKS = [
  { step: '01', icon: Search, title: 'Build your profile', body: 'Complete a 10-minute intake. Tell us about your business, certifications, and goals. Your profile filters the database automatically.' },
  { step: '02', icon: Award, title: 'Discover your matches', body: 'Browse your personalized grant matches scored by eligibility fit. Every grant is verified, active, and relevant to who you are.' },
  { step: '03', icon: FileText, title: 'Apply — or let us', body: 'Use the database yourself for $29/month, or upgrade to Grant Concierge and our AI writes every application for you.' },
]

const TESTIMONIALS = [
  { name: 'Maria Salazar', role: 'Founder, Terra Home Goods', quote: 'I spent 3 months looking for grants on my own and applied to exactly zero. FoundHer helped me find 11 I was eligible for in under an hour.', tag: 'Women-Owned', award: '$22,000 awarded' },
  { name: 'Winona Red Cloud', role: 'CEO, Lakota Tech Collective', quote: 'Finally a platform that actually understands tribal certification and 8(a) programs. Every other database either missed these or had dead links.', tag: 'Indigenous-Owned', award: '$75,000 awarded' },
  { name: 'Danielle Owens', role: 'Founder, Bloom Early Learning', quote: 'The Grant Concierge wrote my full SBA Women\'s grant application in 5 days. I just reviewed it, approved it, and submitted. We won.', tag: 'WOSB Certified', award: '$35,000 awarded' },
]

const PAIN_POINTS = [
  { problem: 'Hours lost searching Google for grants that don\'t apply to you', solution: 'Filtered database — only grants you actually qualify for' },
  { problem: 'Outdated listings with expired deadlines and broken links', solution: 'Every grant verified. Deadlines tracked in real time.' },
  { problem: 'Generic databases that bury tribal and Indigenous-specific grants', solution: 'Built-in filters for WOSB, WBE, Tribal 8(a), and Indigenous programs' },
  { problem: 'Application paralysis — you don\'t know where to start', solution: 'Grant Concierge AI writes the full application. You just submit.' },
]

export default function HomePage() {
  return (
    <main className="min-h-screen bg-cream">
      <Nav transparent />

      {/* HERO */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-clay-50 via-cream to-forest-50" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-clay-200/30 rounded-full blur-3xl" />
        <div className="absolute bottom-20 left-0 w-80 h-80 bg-forest-200/20 rounded-full blur-3xl" />

        <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-12 items-center">
          <div className="opacity-0 animate-fade-up" style={{ animationFillMode: 'forwards' }}>
            <div className="section-label mb-6">Built for founders like you</div>
            <h1 className="heading-display text-5xl md:text-6xl text-charcoal mb-6">
              The grants are{' '}
              <span className="text-clay-500 italic">waiting</span>
              {' '}for you.
            </h1>
            <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-8 max-w-md">
              FoundHer Grants is the only platform built exclusively for women-owned and Indigenous-owned businesses. Find grants you actually qualify for — and let AI write your applications.
            </p>
            <div className="flex flex-wrap gap-4 mb-10">
              <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
                Find My Grants <ArrowRight size={18} />
              </Link>
              <Link href="/pricing" className="btn-secondary text-base px-8 py-4">
                See Pricing
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex -space-x-2">
                {['🌺','🦅','🌿','⭐','🌸'].map((e, i) => (
                  <div key={i} className="w-9 h-9 rounded-full bg-gradient-to-br from-clay-200 to-sand-300 border-2 border-cream flex items-center justify-center text-sm">{e}</div>
                ))}
              </div>
              <p className="font-sans text-sm text-charcoal/60"><span className="font-500 text-charcoal">2,400+ founders</span> found their match</p>
            </div>
          </div>

          {/* Hero visual — grant card preview */}
          <div className="opacity-0 animate-fade-up delay-200" style={{ animationFillMode: 'forwards' }}>
            <div className="relative">
              <div className="card p-6 mb-4 border-l-4 border-l-clay-400">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans text-xs text-clay-500 font-500 uppercase tracking-wide mb-1">New Match • 94% fit</p>
                    <h3 className="font-display font-600 text-charcoal text-lg">Amber Grant for Women</h3>
                    <p className="font-sans text-sm text-charcoal/60">WomensNet Foundation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-700 text-2xl text-forest-600">$10,000</p>
                    <p className="font-sans text-xs text-charcoal/50">Monthly deadline</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="badge-clay">Women-Owned</span>
                  <span className="badge-forest">Private Foundation</span>
                </div>
              </div>
              <div className="card p-6 ml-6 border-l-4 border-l-forest-400">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-sans text-xs text-forest-600 font-500 uppercase tracking-wide mb-1">Featured • 88% fit</p>
                    <h3 className="font-display font-600 text-charcoal text-lg">First Nations Dev. Institute</h3>
                    <p className="font-sans text-sm text-charcoal/60">Native-Focused Foundation</p>
                  </div>
                  <div className="text-right">
                    <p className="font-display font-700 text-2xl text-forest-600">$75,000</p>
                    <p className="font-sans text-xs text-charcoal/50">Deadline Aug 31</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <span className="badge-forest">Indigenous</span>
                  <span className="badge-sand">Foundation</span>
                </div>
              </div>
              {/* Floating badge */}
              <div className="absolute -top-4 -right-4 bg-forest-600 text-white rounded-2xl px-4 py-3 shadow-lg">
                <p className="font-sans text-xs font-500">Your match score</p>
                <p className="font-display font-700 text-2xl">94<span className="text-sm">/100</span></p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* STATS BAR */}
      <section className="bg-charcoal py-12">
        <div className="max-w-6xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <p className="font-display font-700 text-3xl text-clay-400 mb-1">{s.value}</p>
              <p className="font-sans text-xs text-white/50 leading-snug">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PAIN → SOLUTION */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <div className="section-label mb-4">Why FoundHer Exists</div>
          <h2 className="heading-display text-4xl md:text-5xl text-charcoal max-w-2xl mx-auto">
            DIY grant searching is broken.
          </h2>
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {PAIN_POINTS.map((p) => (
            <div key={p.problem} className="card p-6 flex gap-5 items-start">
              <div className="mt-1 w-6 h-6 rounded-full bg-clay-100 flex items-center justify-center flex-shrink-0">
                <div className="w-2 h-2 rounded-full bg-clay-500" />
              </div>
              <div>
                <p className="font-sans text-sm text-charcoal/50 line-through mb-2">{p.problem}</p>
                <p className="font-sans text-sm font-500 text-forest-700 flex items-center gap-2">
                  <CheckCircle size={14} className="text-forest-500 flex-shrink-0" /> {p.solution}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 bg-gradient-to-b from-cream to-clay-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mb-4">How It Works</div>
            <h2 className="heading-display text-4xl md:text-5xl text-charcoal">Three steps to funded.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="card-cream p-8 border border-sand-200">
                <div className="font-display font-700 text-5xl text-clay-200 mb-6">{step.step}</div>
                <step.icon className="text-clay-500 mb-4" size={28} />
                <h3 className="font-display font-600 text-xl text-charcoal mb-3">{step.title}</h3>
                <p className="font-body text-charcoal/70 leading-relaxed">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED GRANTS PREVIEW */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
          <div>
            <div className="section-label mb-3">Live Grant Database Preview</div>
            <h2 className="heading-display text-4xl text-charcoal">Grants available right now.</h2>
          </div>
          <Link href="/auth/signup" className="btn-primary">See All 300+ Grants →</Link>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURED_GRANTS.map((g) => (
            <div key={g.name} className="card p-5 hover:border-clay-300 cursor-pointer transition-all">
              <div className="flex justify-between items-start mb-4">
                <span className={`badge ${g.tag.includes('Indigenous') ? 'badge-forest' : 'badge-clay'}`}>{g.tag}</span>
                <span className="font-sans text-xs text-charcoal/40">{g.type}</span>
              </div>
              <h3 className="font-display font-600 text-charcoal mb-1 leading-snug">{g.name}</h3>
              <p className="font-display font-700 text-xl text-clay-500 mt-3">{g.amount}</p>
              <div className="flex items-center gap-1 mt-2">
                <Clock size={12} className="text-charcoal/30" />
                <span className="font-sans text-xs text-charcoal/40">Deadline: {g.deadline}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <p className="font-sans text-sm text-charcoal/50 mb-4">Sign up to see match scores, eligibility details, and your full personalized grant list.</p>
          <Link href="/auth/signup" className="btn-primary">Create Free Account →</Link>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 bg-charcoal">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="section-label mb-4 text-clay-400">Founder Stories</div>
            <h2 className="heading-display text-4xl text-white">Real founders. Real funding.</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-white/5 border border-white/10 rounded-2xl p-7">
                <div className="flex mb-4 gap-0.5">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-clay-400 fill-clay-400" />)}
                </div>
                <p className="font-body text-white/80 leading-relaxed mb-6 italic">"{t.quote}"</p>
                <div className="flex items-end justify-between">
                  <div>
                    <p className="font-sans font-500 text-white text-sm">{t.name}</p>
                    <p className="font-sans text-xs text-white/40 mt-0.5">{t.role}</p>
                  </div>
                  <div className="text-right">
                    <span className="badge bg-forest-800 text-forest-300">{t.award}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Tier 1 */}
          <div className="card p-8 border-2 border-sand-200">
            <div className="section-label mb-4">Grant Database</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-display font-700 text-5xl text-charcoal">$29</span>
              <span className="font-sans text-charcoal/50 mb-2">/month</span>
            </div>
            <p className="font-body text-charcoal/70 mb-8">Full access to the curated grant database. Search, filter, track, and get alerted on deadlines.</p>
            <ul className="space-y-3 mb-8">
              {['300+ verified grants','Women-owned & Indigenous filters','Deadline tracking + alerts','Weekly grant digest','Certification roadmap'].map(f => (
                <li key={f} className="flex items-center gap-3 font-sans text-sm text-charcoal/80">
                  <CheckCircle size={16} className="text-forest-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="btn-secondary w-full justify-center">Get Database Access</Link>
          </div>

          {/* Tier 2 */}
          <div className="card p-8 border-2 border-clay-400 relative overflow-hidden bg-gradient-to-br from-clay-50 to-cream">
            <div className="absolute top-4 right-4 bg-clay-500 text-white font-sans text-xs font-500 px-3 py-1 rounded-full">Most Popular</div>
            <div className="section-label mb-4 text-clay-600">Grant Concierge</div>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-display font-700 text-5xl text-charcoal">$199</span>
              <span className="font-sans text-charcoal/50 mb-2">/month</span>
            </div>
            <p className="font-sans text-xs text-charcoal/40 mb-2">12-month minimum • avg. ROI $18,500 per year</p>
            <p className="font-body text-charcoal/70 mb-8">AI writes your full grant applications. You approve and submit. Everything else is handled.</p>
            <ul className="space-y-3 mb-8">
              {['Everything in Database','AI writes your full applications','Up to 5 apps/month','Eligibility validation','Submission-ready packages','Step-by-step guides'].map(f => (
                <li key={f} className="flex items-center gap-3 font-sans text-sm text-charcoal/80">
                  <CheckCircle size={16} className="text-forest-500 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup?tier=concierge" className="btn-primary w-full justify-center">Start Grant Concierge →</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 bg-gradient-to-br from-clay-500 to-clay-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="heading-display text-4xl md:text-5xl mb-6">Your funding is waiting.</h2>
          <p className="font-body text-xl text-white/80 mb-10 leading-relaxed">
            Women-owned and Indigenous-owned businesses are among the most grant-eligible founders in the country. The only problem is finding the right grants. That's what we do.
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-clay-600 font-sans font-500 text-lg rounded-full hover:bg-cream transition-colors shadow-lg">
            Find My Grants Now <ArrowRight size={20} />
          </Link>
          <p className="font-sans text-sm text-white/50 mt-6">No credit card required to browse grants.</p>
        </div>
      </section>

      <Footer />
    </main>
  )
}
