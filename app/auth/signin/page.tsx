'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'

export default function SignInPage() {
  const router = useRouter()
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email: form.email, password: form.password })
    if (error) { setError('Invalid email or password.'); setLoading(false); return }
    router.push('/dashboard')
  }

  return (
    <div>
      <h1 className="font-display font-700 text-3xl text-charcoal mb-2">Welcome back.</h1>
      <p className="font-body text-charcoal/60 mb-8">Sign in to your FoundHer account.</p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" required value={form.email}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
        </div>
        <div>
          <label className="label">Password</label>
          <div className="relative">
            <input className="input pr-12" type={showPw ? 'text' : 'password'} required
              value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40"
              onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        {error && <div className="bg-clay-50 border border-clay-200 text-clay-700 rounded-xl p-3 font-sans text-sm">{error}</div>}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
          {loading ? 'Signing in...' : <>Sign In <ArrowRight size={18} /></>}
        </button>
      </form>

      <div className="mt-4 text-right">
        <Link href="/auth/reset" className="font-sans text-sm text-clay-500 hover:text-clay-700">Forgot password?</Link>
      </div>
      <p className="font-sans text-sm text-charcoal/50 mt-6 text-center">
        Don't have an account?{' '}
        <Link href="/auth/signup" className="text-clay-500 hover:text-clay-700 font-500">Create one free</Link>
      </p>
    </div>
  )
}
