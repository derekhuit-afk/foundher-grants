'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignUpForm() {
  const router = useRouter()
  const params = useSearchParams()
  const tier = params.get('tier')
  const [form, setForm] = useState({ full_name: '', email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [agreedTos, setAgreedTos] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreedTos) { setError('You must agree to the Terms of Service and Privacy Policy to create an account.'); return }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
      options: { data: { full_name: form.full_name, tos_accepted_at: new Date().toISOString() } },
    })
    if (error) { setError(error.message); setLoading(false); return }
    router.push(tier === 'concierge' ? '/dashboard/onboarding?tier=concierge' : '/dashboard/onboarding')
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Find your grants.</h1>
      <p className="font-body text-charcoal/60 mb-8">
        {tier === 'concierge' ? 'Start your Grant Concierge account.' : 'Create your free FoundHer account.'}
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Your full name</label>
          <input className="input" type="text" placeholder="Maria Salazar" required value={form.full_name}
            onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} />
        </div>
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" placeholder="you@yourbusiness.com" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-12" type={showPw ? 'text' : 'password'} placeholder="8+ characters" required
              minLength={8} value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
              onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <div className="bg-clay-50 border border-clay-200 text-clay-700 rounded-xl p-3 font-sans text-sm">{error}</div>}
        <div className="flex items-start gap-3">
          <input type="checkbox" id="tos-agree" checked={agreedTos}
            onChange={e => setAgreedTos(e.target.checked)}
            className="mt-1 w-4 h-4 rounded border-sand-300 text-clay-500 focus:ring-clay-400 cursor-pointer flex-shrink-0" />
          <label htmlFor="tos-agree" className="font-sans text-xs text-charcoal/60 leading-relaxed cursor-pointer">
            I have read and agree to the{' '}
            <Link href="/terms" target="_blank" className="text-clay-500 hover:text-clay-700 underline">Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" target="_blank" className="text-clay-500 hover:text-clay-700 underline">Privacy Policy</Link>.
            I understand that AI-generated grant content must be reviewed before submission and that FoundHer Grants does not guarantee funding.
          </label>
        </div>
        <button type="submit" disabled={loading || !agreedTos} className="btn-primary w-full justify-center py-4 text-base disabled:opacity-50 disabled:cursor-not-allowed">
          {loading ? 'Creating account...' : <><span>Create My Account</span> <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="font-sans text-sm text-charcoal/50 mt-6 text-center">
        Already have an account?{' '}
        <Link href="/auth/signin" className="text-clay-500 hover:text-clay-700 font-medium">Sign in</Link>
      </p>
    </div>
  )
}
