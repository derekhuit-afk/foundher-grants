'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Save, CreditCard, Bell, User, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null)
  const [alerts, setAlerts] = useState<any>(null)
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSavedState] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return
      const [{ data: p }, { data: a }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('alert_preferences').select('*').eq('user_id', user.id).single(),
      ])
      setProfile(p); setAlerts(a); setName(p?.full_name || '')
    }
    load()
  }, [])

  const saveProfile = async () => {
    setSaving(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    await supabase.from('profiles').update({ full_name: name }).eq('id', user.id)
    setSaving(false); setSavedState(true)
    setTimeout(() => setSavedState(false), 2000)
  }

  const toggleAlert = async (key: string, value: boolean) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const update = { [key]: value }
    await supabase.from('alert_preferences').update(update).eq('user_id', user.id)
    setAlerts((a: any) => ({ ...a, ...update }))
  }

  const handleUpgrade = async (tier: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const res = await fetch('/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, tier }),
    })
    const { url } = await res.json()
    if (url) window.location.href = url
  }

  if (!profile) return <div className="p-8"><div className="card p-8 animate-pulse h-48" /></div>

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <p className="section-label mb-2">Settings</p>
        <h1 className="heading-display text-3xl text-charcoal">Account settings.</h1>
      </div>

      {/* Profile */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <User size={18} className="text-clay-500" />
          <h2 className="font-display font-semibold text-lg text-charcoal">Profile</h2>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Full name</label>
            <input className="input" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email address</label>
            <input className="input bg-sand-50" value={profile.email} disabled />
            <p className="font-sans text-xs text-charcoal/40 mt-1">Email cannot be changed.</p>
          </div>
          <button onClick={saveProfile} disabled={saving}
            className="btn-primary flex items-center gap-2">
            {saved ? <><CheckCircle size={16} /> Saved!</> : <><Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}</>}
          </button>
        </div>
      </div>

      {/* Subscription */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-3 mb-5">
          <CreditCard size={18} className="text-clay-500" />
          <h2 className="font-display font-semibold text-lg text-charcoal">Subscription</h2>
        </div>
        <div className="bg-sand-50 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-sans font-medium text-charcoal capitalize">
                {profile.subscription_tier === 'free' ? 'Free Plan' : profile.subscription_tier === 'tier1' ? 'Grant Database — $29/month' : 'Grant Concierge — $199/month'}
              </p>
              <p className="font-sans text-xs text-charcoal/50 mt-0.5 capitalize">Status: {profile.subscription_status || 'inactive'}</p>
            </div>
            <span className={`badge ${profile.subscription_status === 'active' ? 'badge-forest' : 'badge-sand'}`}>
              {profile.subscription_status === 'active' ? 'Active' : 'Inactive'}
            </span>
          </div>
        </div>
        {profile.subscription_tier === 'free' && (
          <button onClick={() => handleUpgrade('tier1')} className="btn-primary w-full justify-center">
            Upgrade to Database — $29/month
          </button>
        )}
        {profile.subscription_tier === 'tier1' && (
          <button onClick={() => handleUpgrade('tier2')} className="btn-primary w-full justify-center">
            Upgrade to Concierge — $199/month
          </button>
        )}
      </div>

      {/* Alerts */}
      {alerts && (
        <div className="card p-6">
          <div className="flex items-center gap-3 mb-5">
            <Bell size={18} className="text-clay-500" />
            <h2 className="font-display font-semibold text-lg text-charcoal">Email Alerts</h2>
          </div>
          <div className="space-y-4">
            {[
              { key: 'weekly_digest', label: 'Weekly grant digest', desc: 'New matching grants every Monday morning' },
              { key: 'new_grant_alerts', label: 'New grant alerts', desc: 'Immediate notification when a new grant matches your profile' },
              { key: 'deadline_alerts', label: 'Deadline reminders', desc: 'Alert 14 days before saved grant deadlines' },
              { key: 'upgrade_nudges', label: 'Upgrade tips', desc: 'Occasional tips about getting more from FoundHer' },
            ].map(({ key, label, desc }) => (
              <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <p className="font-sans text-sm font-medium text-charcoal">{label}</p>
                  <p className="font-sans text-xs text-charcoal/50">{desc}</p>
                </div>
                <div
                  onClick={() => toggleAlert(key, !alerts[key])}
                  className={`w-10 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 relative ${alerts[key] ? 'bg-forest-500' : 'bg-sand-300'}`}>
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-transform ${alerts[key] ? 'translate-x-5' : 'translate-x-1'}`} />
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
