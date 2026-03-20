import Link from 'next/link'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import { ArrowRight, FileText, Brain, CheckCircle, Shield, Zap, Clock } from 'lucide-react'

const STEPS = [
  { icon: Brain, title: 'You build your profile', desc: 'Answer a few questions about your business, certifications, and goals. This becomes the foundation for every application.' },
  { icon: Zap, title: 'AI writes your application', desc: 'Our AI drafts a complete, submission-ready grant application tailored to each funder\'s requirements and scoring criteria.' },
  { icon: Shield, title: 'You review and approve', desc: 'Every application goes through your review before submission. You stay in full control — AI handles the writing, you make the calls.' },
  { icon: FileText, title: 'Submit and track', desc: 'Submit directly or download your package. Track every application through your dashboard with status updates and deadline alerts.' },
]

const FEATURES = [
  'Up to 5 AI-written applications per month',
  'Eligibility pre-screening on every grant',
  'Narrative generation aligned to funder priorities',
  'Budget template and justification drafts',
  'GEPA 427 equity language (federal grants)',
  'Application status tracking dashboard',
  'Deadline alerts and calendar sync',
  'Full grant database access (300+ grants)',
]

export default function ConciergePage() {
  return (
    <main className="min-h-screen bg-cream">
      <Nav />

      {/* Hero */}
      <section className="pt-28 pb-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="section-label mb-4">Grant Concierge</p>
            <h1 className="heading-display text-4xl md:text-5xl text-charcoal mb-6">
              AI writes your grants. <span className="text-clay-500 italic">You just submit.</span>
            </h1>
            <p className="font-body text-lg text-charcoal/70 leading-relaxed mb-8 max-w-md">
              Stop spending weeks on applications. Our AI generates complete, submission-ready grant packages tailored to each funder — in hours, not months.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/auth/signup?tier=concierge" className="btn-primary text-base px-8 py-4">
                Start Grant Concierge <ArrowRight size={18} />
              </Link>
              <Link href="/grants" className="btn-secondary text-base px-8 py-4">
                Browse Grants First
              </Link>
            </div>
          </div>
          <div className="relative">
            <div className="card p-6 border-l-4 border-l-clay-400">
              <p className="font-sans text-xs text-clay-500 font-medium uppercase tracking-wide mb-2">AI-Generated Draft</p>
              <div className="space-y-3">
                <div className="h-3 bg-sand-200 rounded w-full" />
                <div className="h-3 bg-sand-200 rounded w-5/6" />
                <div className="h-3 bg-sand-200 rounded w-4/5" />
                <div className="h-3 bg-sand-100 rounded w-3/4" />
                <div className="h-3 bg-sand-200 rounded w-full" />
                <div className="h-3 bg-sand-200 rounded w-2/3" />
              </div>
              <div className="mt-4 flex gap-2">
                <span className="badge-clay">Women-Owned</span>
                <span className="badge-forest">Federal Grant</span>
              </div>
            </div>
            <div className="absolute -top-3 -right-3 bg-forest-600 text-white rounded-2xl px-4 py-2 shadow-lg">
              <p className="font-sans text-xs font-medium">Generated in</p>
              <p className="font-display font-bold text-xl">4 hours</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-gradient-to-b from-cream to-clay-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <p className="section-label mb-4">How It Works</p>
            <h2 className="heading-display text-4xl text-charcoal">Four steps to a funded application.</h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {STEPS.map((step, i) => (
              <div key={i} className="card-cream p-6 border border-sand-200">
                <div className="font-display font-bold text-4xl text-clay-200 mb-4">{String(i + 1).padStart(2, '0')}</div>
                <step.icon size={24} className="text-clay-500 mb-3" />
                <h3 className="font-display font-semibold text-lg text-charcoal mb-2">{step.title}</h3>
                <p className="font-body text-sm text-charcoal/70 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features + Pricing */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="section-label mb-4">What You Get</p>
            <h2 className="heading-display text-3xl text-charcoal mb-8">Everything included in Grant Concierge.</h2>
            <ul className="space-y-4">
              {FEATURES.map((f, i) => (
                <li key={i} className="flex items-start gap-3">
                  <CheckCircle size={18} className="text-forest-500 mt-0.5 flex-shrink-0" />
                  <span className="font-sans text-sm text-charcoal/80">{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-8 border-2 border-clay-400 bg-gradient-to-br from-clay-50 to-cream sticky top-24">
            <div className="bg-clay-500 text-white font-sans text-xs font-medium px-3 py-1 rounded-full inline-block mb-4">Most Popular</div>
            <p className="section-label mb-2 text-clay-600">Grant Concierge</p>
            <div className="flex items-end gap-1 mb-2">
              <span className="font-display font-bold text-5xl text-charcoal">$199</span>
              <span className="font-sans text-charcoal/50 mb-2">/month</span>
            </div>
            <p className="font-sans text-xs text-charcoal/40 mb-6">12-month minimum · avg. ROI $18,500 per year</p>
            <Link href="/auth/signup?tier=concierge" className="btn-primary w-full justify-center text-base py-4 mb-4">
              Start Grant Concierge <ArrowRight size={18} />
            </Link>
            <p className="font-sans text-xs text-charcoal/40 text-center">
              Or start with <Link href="/auth/signup" className="text-clay-500 hover:text-clay-700 underline">Database access at $29/mo</Link>
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-clay-500 to-clay-700 text-white text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="heading-display text-4xl mb-6">Stop writing grants alone.</h2>
          <p className="font-body text-xl text-white/80 mb-10 leading-relaxed">
            Let AI handle the heavy lifting while you focus on running your business. Grant Concierge members win an average of $18,500 in their first year.
          </p>
          <Link href="/auth/signup?tier=concierge" className="inline-flex items-center gap-2 px-10 py-5 bg-white text-clay-600 font-sans font-medium text-lg rounded-full hover:bg-cream transition-colors shadow-lg">
            Get Started <ArrowRight size={20} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  )
}
