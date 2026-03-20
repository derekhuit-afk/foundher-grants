'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, ArrowRight, CheckCircle, Lock } from 'lucide-react'

export default function ResetConfirmPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [sessionReady, setSessionReady] = useState(false)

  useEffect(() => {
    // Supabase automatically handles the token from the URL hash
    const supabase = createClient()
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setSessionReady(true)
      }
    })
    // Also check if already in a session (token already exchanged)
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true)
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    setLoading(true)
    setError('')
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }
    setSuccess(true)
    setLoading(false)
    setTimeout(() => router.push('/dashboard'), 2000)
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={24} className="text-forest-600" />
        </div>
        <h1 className="font-display font-bold text-3xl text-charcoal mb-3">Password updated.</h1>
        <p className="font-body text-charcoal/60 mb-6">
          Your password has been reset successfully. Redirecting you to your dashboard...
        </p>
      </div>
    )
  }

  if (!sessionReady) {
    return (
      <div className="text-center">
        <div className="w-14 h-14 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock size={24} className="text-charcoal/40" />
        </div>
        <h1 className="font-display font-bold text-3xl text-charcoal mb-3">Verifying your link...</h1>
        <p className="font-body text-charcoal/60 mb-6">
          If this page doesn't update in a few seconds, your reset link may have expired.
        </p>
        <Link href="/auth/reset" className="btn-secondary text-sm">
          Request a new link
        </Link>
      </div>
    )
  }

  return (
    <div>
      <h1 className="font-display font-bold text-3xl text-charcoal mb-2">Set a new password.</h1>
      <p className="font-body text-charcoal/60 mb-8">Choose a strong password for your FoundHer account.</p>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="label">New password</label>
          <div className="relative">
            <input className="input pr-12" type={showPw ? 'text' : 'password'} placeholder="8+ characters"
              required minLength={8} value={password} onChange={e => setPassword(e.target.value)} />
            <button type="button" className="absolute right-4 top-1/2 -translate-y-1/2 text-charcoal/40 hover:text-charcoal/70"
              onClick={() => setShowPw(!showPw)}>
              {showPw ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm new password</label>
          <input className="input" type="password" placeholder="Repeat your password"
            required minLength={8} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
        </div>
        {error && (
          <div className="bg-clay-50 border border-clay-200 text-clay-700 rounded-xl p-3 font-sans text-sm">{error}</div>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-4 text-base">
          {loading ? 'Updating...' : <>Update Password <ArrowRight size={18} /></>}
        </button>
      </form>
    </div>
  )
}
