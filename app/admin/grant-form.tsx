'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PlusCircle, CheckCircle } from 'lucide-react'

const ELIGIBLE_OPTIONS = ['women_owned','indigenous','wosb','wbe','tribal_8a','bipoc','veteran']
const TYPE_OPTIONS = ['federal','state','local','private_foundation','corporate','tribal']

export default function AdminGrantForm() {
  const [form, setForm] = useState({
    name: '', grantor_organization: '', grantor_type: 'private_foundation',
    min_amount: '', max_amount: '', amount_display: '', deadline: '',
    description: '', grant_purpose: '', source_url: '', application_url: '',
    eligible_for: [] as string[], competition_level: 'medium', featured: false,
  })
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)

  const toggle = (key: string) => {
    const arr: string[] = form.eligible_for
    setForm(f => ({ ...f, eligible_for: arr.includes(key) ? arr.filter(x => x !== key) : [...arr, key] }))
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    await supabase.from('grants').insert({
      ...form,
      min_amount: form.min_amount ? parseInt(form.min_amount) : null,
      max_amount: form.max_amount ? parseInt(form.max_amount) : null,
      deadline: form.deadline || null,
      is_active: true,
      last_verified: new Date().toISOString().split('T')[0],
    })
    setSaving(false); setSuccess(true)
    setForm({ name: '', grantor_organization: '', grantor_type: 'private_foundation', min_amount: '', max_amount: '', amount_display: '', deadline: '', description: '', grant_purpose: '', source_url: '', application_url: '', eligible_for: [], competition_level: 'medium', featured: false })
    setTimeout(() => setSuccess(false), 3000)
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="label">Grant Name *</label><input className="input" required value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))} /></div>
        <div><label className="label">Grantor Organization *</label><input className="input" required value={form.grantor_organization} onChange={e => setForm(f => ({...f, grantor_organization: e.target.value}))} /></div>
      </div>
      <div className="grid md:grid-cols-4 gap-4">
        <div><label className="label">Type</label>
          <select className="input" value={form.grantor_type} onChange={e => setForm(f => ({...f, grantor_type: e.target.value}))}>
            {TYPE_OPTIONS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div><label className="label">Min Amount</label><input className="input" type="number" value={form.min_amount} onChange={e => setForm(f => ({...f, min_amount: e.target.value}))} /></div>
        <div><label className="label">Max Amount</label><input className="input" type="number" value={form.max_amount} onChange={e => setForm(f => ({...f, max_amount: e.target.value}))} /></div>
        <div><label className="label">Display Amount</label><input className="input" placeholder="e.g. Up to $10,000" value={form.amount_display} onChange={e => setForm(f => ({...f, amount_display: e.target.value}))} /></div>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="label">Deadline</label><input className="input" type="date" value={form.deadline} onChange={e => setForm(f => ({...f, deadline: e.target.value}))} /></div>
        <div><label className="label">Competition Level</label>
          <select className="input" value={form.competition_level} onChange={e => setForm(f => ({...f, competition_level: e.target.value}))}>
            {['low','medium','high','very_high'].map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
      </div>
      <div><label className="label">Description</label><textarea className="input min-h-20 resize-y" value={form.description} onChange={e => setForm(f => ({...f, description: e.target.value}))} /></div>
      <div className="grid md:grid-cols-2 gap-4">
        <div><label className="label">Source URL</label><input className="input" type="url" value={form.source_url} onChange={e => setForm(f => ({...f, source_url: e.target.value}))} /></div>
        <div><label className="label">Application URL</label><input className="input" type="url" value={form.application_url} onChange={e => setForm(f => ({...f, application_url: e.target.value}))} /></div>
      </div>
      <div>
        <label className="label mb-2">Eligible For</label>
        <div className="flex flex-wrap gap-2">
          {ELIGIBLE_OPTIONS.map(o => (
            <button key={o} type="button" onClick={() => toggle(o)}
              className={`px-3 py-1.5 rounded-full border font-sans text-xs transition-colors ${form.eligible_for.includes(o) ? 'bg-clay-500 text-white border-clay-500' : 'border-sand-300 text-charcoal/60 hover:border-clay-300'}`}>
              {o.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={form.featured} onChange={e => setForm(f => ({...f, featured: e.target.checked}))} className="rounded" />
          <span className="font-sans text-sm text-charcoal">Feature this grant (shows on homepage + dashboard)</span>
        </label>
      </div>
      <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2">
        {success ? <><CheckCircle size={16} /> Grant Added!</> : <><PlusCircle size={16} /> {saving ? 'Adding...' : 'Add Grant to Database'}</>}
      </button>
    </form>
  )
}
