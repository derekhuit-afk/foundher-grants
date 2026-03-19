import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Sparkles } from 'lucide-react'

const TIER1_FEATURES = [
  'Access to 300+ curated, verified grants',
  'Filter by women-owned, Indigenous, WOSB, tribal',
  'Deadline tracking + calendar view',
  'Weekly grant digest emails',
  'Save and track up to 50 grants',
  'Certification roadmap (WOSB, WBE, 8(a))',
  'Grant match scores based on your profile',
  'New grant alerts matching your profile',
]

const TIER2_FEATURES = [
  'Everything in Grant Database',
  'AI writes complete application narratives',
  'Executive summary, mission alignment, founder bio',
  'Use of funds + community impact sections',
  'Up to 5 full applications per month',
  'Eligibility validation before every application',
  'Submission-ready package delivered to your portal',
  'Step-by-step submission guide per grant',
  'Application outcome tracking',
  'Priority email support',
]

const FAQS = [
  { q: 'Is there a free trial?', a: 'No free trial — but there\'s no risk either. Your $29/month Database plan gives you immediate access to 300+ grants. If you find one grant worth applying for in month one, it\'s already paid for itself many times over.' },
  { q: 'What does the 12-month minimum for Concierge mean?', a: 'Grant writing is a long game. Most grants take 30–90 days to hear back, and building a track record of strong applications improves outcomes over time. The 12-month contract reflects that reality — and at $199/month, one successful grant application (average award: $18,500) covers your entire year.' },
  { q: 'How does the AI actually write my applications?', a: 'Our AI is trained specifically on grant writing for women-owned and Indigenous-owned businesses. It reads your founder profile, cross-references the grant\'s stated priorities, and produces full narrative sections: executive summary, mission alignment, founder biography, use of funds, community impact, and a cover letter. Every output passes a 7-point quality gate before delivery.' },
  { q: 'Do I need certifications to use FoundHer?', a: 'No. Many grants in our database don\'t require certifications. For those that do, our platform shows you exactly what certifications unlock which grants — and gives you a roadmap to obtain them.' },
  { q: 'What types of grants are in the database?', a: 'Federal grants (SBA, USDA, EDA, HUD, BIA), state-level grants, private foundation grants, and corporate grants — all filtered to be relevant to women-owned and/or Indigenous/tribal-owned businesses.' },
  { q: 'Can the AI submit applications for me?', a: 'Most grant applications require the founder to submit directly through the grantor\'s portal or by email. Our Delivery Agent produces a complete, formatted package and a step-by-step submission guide so you can submit in minutes.' },
]

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-cream">
      <Nav />
      <div className="pt-32 pb-20 max-w-5xl mx-auto px-6">

        {/* Header */}
        <div className="text-center mb-16">
          <div className="section-label mb-4">Pricing</div>
          <h1 className="heading-display text-5xl text-charcoal mb-4">Simple, transparent pricing.</h1>
          <p className="font-body text-xl text-charcoal/60 max-w-xl mx-auto">
            Two tiers. No hidden fees. No free trial needed — because the value is obvious from day one.
          </p>
        </div>

        {/* Plans */}
        <div className="grid md:grid-cols-2 gap-8 mb-20">

          {/* Tier 1 */}
          <div className="card p-8 flex flex-col">
            <div className="mb-6">
              <div className="section-label mb-3">Grant Database</div>
              <div className="flex items-end gap-1 mb-1">
                <span className="font-display font-700 text-6xl text-charcoal">$29</span>
                <span className="font-sans text-charcoal/50 mb-3 text-lg">/month</span>
              </div>
              <p className="font-sans text-sm text-charcoal/40">Cancel any time. No contracts.</p>
            </div>
            <p className="font-body text-charcoal/70 mb-8 leading-relaxed">
              Full access to the curated grant database, built exclusively for women-owned and Indigenous-owned businesses. Search, filter, save, and track deadlines.
            </p>
            <ul className="space-y-3 mb-10 flex-1">
              {TIER1_FEATURES.map(f => (
                <li key={f} className="flex items-start gap-3 font-sans text-sm text-charcoal/80">
                  <CheckCircle size={16} className="text-forest-500 mt-0.5 flex-shrink-0" /> {f}
                </li>
              ))}
            </ul>
            <Link href="/auth/signup" className="btn-secondary w-full justify-center text-base py-4">
              Start Database Access
            </Link>
          </div>

          {/* Tier 2 */}
          <div className="flex flex-col rounded-2xl border-2 border-clay-400 overflow-hidden relative">
            <div className="bg-clay-500 text-white text-center py-3">
              <span className="font-sans font-500 text-sm tracking-wide">MOST POPULAR — HIGHEST ROI</span>
            </div>
            <div className="bg-gradient-to-br from-clay-50 to-cream p-8 flex flex-col flex-1">
              <div className="mb-6">
                <div className="section-label mb-3 text-clay-600">Grant Concierge</div>
                <div className="flex items-end gap-1 mb-1">
                  <span className="font-display font-700 text-6xl text-charcoal">$199</span>
                  <span className="font-sans text-charcoal/50 mb-3 text-lg">/month</span>
                </div>
                <p className="font-sans text-sm text-charcoal/40">12-month minimum commitment</p>
              </div>
              <div className="bg-forest-50 border border-forest-200 rounded-xl p-4 mb-6">
                <p className="font-sans text-sm font-500 text-forest-700">Average ROI: $18,500/year</p>
                <p className="font-sans text-xs text-forest-600 mt-0.5">One successful grant covers your entire annual subscription 7×</p>
              </div>
              <p className="font-body text-charcoal/70 mb-8 leading-relaxed">
                Our AI writes your complete grant applications — every section, every form, submission-ready. You approve and submit. We handle everything else.
              </p>
              <ul className="space-y-3 mb-10 flex-1">
                {TIER2_FEATURES.map(f => (
                  <li key={f} className="flex items-start gap-3 font-sans text-sm text-charcoal/80">
                    <CheckCircle size={16} className="text-forest-500 mt-0.5 flex-shrink-0" /> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/signup?tier=concierge" className="btn-primary w-full justify-center text-base py-4">
                <Sparkles size={18} /> Start Grant Concierge →
              </Link>
              <p className="font-sans text-xs text-charcoal/40 text-center mt-3">
                $2,388/year · avg. grant award $18,500
              </p>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div className="bg-charcoal rounded-2xl p-10 text-white mb-20 text-center">
          <h2 className="heading-display text-3xl mb-4">The math is simple.</h2>
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-8">
            {[
              { label: 'Annual Concierge cost', value: '$2,388', sub: '$199 × 12 months' },
              { label: 'Avg. grant award', value: '$18,500', sub: 'Per successful application' },
              { label: 'ROI on first grant', value: '675%', sub: 'One win covers 7 years' },
            ].map(item => (
              <div key={item.label}>
                <p className="font-display font-700 text-4xl text-clay-400 mb-1">{item.value}</p>
                <p className="font-sans text-sm text-white/70 mb-1">{item.label}</p>
                <p className="font-sans text-xs text-white/30">{item.sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className="max-w-3xl mx-auto">
          <h2 className="heading-display text-3xl text-charcoal text-center mb-10">Common questions.</h2>
          <div className="space-y-6">
            {FAQS.map(faq => (
              <div key={faq.q} className="card p-6">
                <p className="font-sans font-500 text-charcoal mb-3">{faq.q}</p>
                <p className="font-body text-sm text-charcoal/70 leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-20">
          <h2 className="heading-display text-3xl text-charcoal mb-4">Ready to find your grants?</h2>
          <p className="font-body text-charcoal/60 mb-8">Start with the Database at $29. Upgrade when you're ready for the AI to take over.</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/auth/signup" className="btn-primary text-base px-8 py-4">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link href="/auth/signup?tier=concierge" className="btn-secondary text-base px-8 py-4">
              Start Concierge
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
