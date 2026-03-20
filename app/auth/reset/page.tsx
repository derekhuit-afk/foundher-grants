'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowLeft, ArrowRight, Mail, CheckCircle } from 'lucide-react'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-confirm`,
    })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Mail size={24} className="text-forest-600" />
        </div>
        <h1 className="font-display font-bold text-3xl text-charcoal mb-3">Check your email.</h1>
        <p className="font-body text-charcoal/60 mb-6 leading-relaxed">
          We sent a password reset link to <strong className="text-charcoal">{email}</strong>. Click the link in the email to set a new password.
        </p>
        <p className="font-sans text-xs text-charcoal/40 mb-8">
          Didn't get it? Check your spam folder, or wait a minute and try again.
        </p>
        <button onClick={() => setSent(false)}
          className="btn-secondary text-sm">
          Send again
        </button>
        <p className="font-sans text-sm text-charcoal/50 mt-6">
          <Link href="/auth/signin" className="text-clay-500 hover:text-clay-700 font-medium flex items-center justify-center gap-1">
            <ArrowLeft size={14} /> Back to sign in
          </Link>
        </p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Reset your password.</h1>
      <p className="font-body text-charcoal/60 mb-8">
        Enter the email address associated with your account and we'll send you a link to reset your password.
      </p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">Email address</label>
          <input className="input" type="email" placeholder="you@yourbusiness.com" required
            value={email} onChange={e => setEmail(e.target.value)} />
        </div>
        {error && (
          <div className="bg-clay-50 border border-clay-200 text-clay-700 rounded-xl p-3 font-sans text-sm">{error}</div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
          {loading ? 'Sending...' : <>Send Reset Link <ArrowRight size={18} /></>}
        </button>
      </form>
      <p className="font-sans text-sm text-charcoal/50 mt-6 text-center">
        <Link href="/auth/signin" className="text-clay-500 hover:text-clay-700 font-medium flex items-center justify-center gap-1">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </p>
    </div>
  )
}
