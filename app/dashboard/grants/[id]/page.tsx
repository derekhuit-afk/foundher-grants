'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import {
  ArrowLeft, ExternalLink, Clock, Bookmark, BookmarkCheck,
  FileText, CheckCircle, AlertCircle, Loader, Send, ChevronDown, ChevronUp,
  Download, Sparkles, Shield, Building, MapPin, Calendar, DollarSign
} from 'lucide-react'
import { formatCurrency, daysUntil, cn } from '@/lib/utils'

type FormField = {
  id: string; label: string; type: string; required: boolean;
  placeholder?: string; options?: string[]; section?: string; help_text?: string;
}

export default function GrantDetailPage() {
  const params = useParams()
  const router = useRouter()
  const grantId = params.id as string
  const supabase = createClient()

  const [grant, setGrant] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)
  const [enriching, setEnriching] = useState(false)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['Organization Information', 'Contact Information']))
  const [activeTab, setActiveTab] = useState<'overview' | 'apply'>('overview')

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      const { data: g } = await supabase.from('grants').select('*').eq('id', grantId).single()
      setGrant(g)

      if (user) {
        const { data: fp } = await supabase.from('founder_profiles').select('*').eq('user_id', user.id).single()
        setProfile(fp)
        const { data: sv } = await supabase.from('saved_grants').select('id').eq('user_id', user.id).eq('grant_id', grantId)
        setSaved((sv || []).length > 0)

        // Pre-fill form with profile data
        if (fp) {
          setFormData(prev => ({
            ...prev,
            org_name: fp.business_name || '',
            org_city: fp.city || '',
            org_state: fp.state || '',
            org_zip: fp.zip || '',
            org_industry: fp.industry || '',
            contact_name: user.user_metadata?.full_name || '',
            contact_email: user.email || '',
          }))
        }

        // Check for existing application
        const { data: app } = await supabase.from('grant_applications').select('*').eq('user_id', user.id).eq('grant_id', grantId).single()
        if (app?.status === 'submitted') setSubmitted(true)
        if (app?.budget_json && typeof app.budget_json === 'object') {
          setFormData(prev => ({ ...prev, ...app.budget_json }))
        }
      }
      setLoading(false)
    }
    init()
  }, [grantId])

  const toggleSave = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    if (saved) {
      await supabase.from('saved_grants').delete().eq('user_id', user.id).eq('grant_id', grantId)
      setSaved(false)
    } else {
      await supabase.from('saved_grants').insert({ user_id: user.id, grant_id: grantId })
      setSaved(true)
    }
  }

  const enrichGrant = async () => {
    setEnriching(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const res = await fetch('/api/enrich-grant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ grantId, secret: '' }),
      })
      if (res.ok) {
        const { data: refreshed } = await supabase.from('grants').select('*').eq('id', grantId).single()
        setGrant(refreshed)
      }
    } catch (e) { console.error(e) }
    setEnriching(false)
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }))
  }

  const handleSubmit = async () => {
    setSubmitting(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    // Save/update application
    const { data: existing } = await supabase.from('grant_applications')
      .select('id').eq('user_id', user.id).eq('grant_id', grantId).single()

    if (existing) {
      await supabase.from('grant_applications').update({
        budget_json: formData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }).eq('id', existing.id)
    } else {
      await supabase.from('grant_applications').insert({
        user_id: user.id,
        grant_id: grantId,
        budget_json: formData,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
    }
    setSubmitted(true)
    setSubmitting(false)
  }

  const saveDraft = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data: existing } = await supabase.from('grant_applications')
      .select('id').eq('user_id', user.id).eq('grant_id', grantId).single()
    if (existing) {
      await supabase.from('grant_applications').update({ budget_json: formData, updated_at: new Date().toISOString() }).eq('id', existing.id)
    } else {
      await supabase.from('grant_applications').insert({ user_id: user.id, grant_id: grantId, budget_json: formData, status: 'draft' })
    }
  }

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const next = new Set(prev)
      next.has(section) ? next.delete(section) : next.add(section)
      return next
    })
  }

  if (loading) return (
    <div className="p-8 flex items-center justify-center min-h-[400px]">
      <Loader className="animate-spin text-clay-400" size={32} />
    </div>
  )

  if (!grant) return (
    <div className="p-8 text-center">
      <p className="font-display text-2xl text-charcoal/30 mb-4">Grant not found</p>
      <Link href="/dashboard/grants" className="btn-secondary text-sm">Back to Grants</Link>
    </div>
  )

  const days = grant.deadline ? daysUntil(grant.deadline) : null
  const formFields: FormField[] = grant.form_fields || []
  const sections = [...new Set(formFields.map(f => f.section || 'General'))]

  return (
    <div className="p-8 max-w-4xl">
      {/* Back nav */}
      <Link href="/dashboard/grants" className="inline-flex items-center gap-1 font-sans text-sm text-charcoal/50 hover:text-clay-500 mb-6">
        <ArrowLeft size={14} /> Back to Grants
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-6">
        <div className="flex-1">
          <div className="flex flex-wrap gap-2 mb-3">
            {grant.eligible_for?.map((e: string) => (
              <span key={e} className={`badge text-xs ${e.includes('indigenous') || e.includes('tribal') ? 'badge-forest' : 'badge-clay'}`}>
                {e.replace('_', ' ')}
              </span>
            ))}
            <span className="badge badge-sand text-xs">{grant.grantor_type?.replace('_', ' ')}</span>
          </div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-charcoal leading-tight">{grant.name}</h1>
          <p className="font-sans text-charcoal/50 mt-1">{grant.grantor_organization}</p>
        </div>
        <button onClick={toggleSave} className="p-2 rounded-xl hover:bg-sand-100 transition-colors flex-shrink-0">
          {saved ? <BookmarkCheck size={22} className="text-clay-500" /> : <Bookmark size={22} className="text-charcoal/30" />}
        </button>
      </div>

      {/* Key stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
        <div className="card p-4">
          <DollarSign size={16} className="text-clay-500 mb-2" />
          <p className="font-display font-bold text-xl text-charcoal">{grant.amount_display || formatCurrency(grant.max_amount)}</p>
          <p className="font-sans text-xs text-charcoal/40">Award Amount</p>
        </div>
        <div className="card p-4">
          <Calendar size={16} className="text-clay-500 mb-2" />
          <p className="font-display font-bold text-xl text-charcoal">
            {days !== null ? (days > 0 ? `${days} days` : 'Closed') : 'Rolling'}
          </p>
          <p className="font-sans text-xs text-charcoal/40">Deadline</p>
        </div>
        <div className="card p-4">
          <Shield size={16} className="text-clay-500 mb-2" />
          <p className="font-display font-bold text-xl text-charcoal capitalize">{grant.competition_level || 'Medium'}</p>
          <p className="font-sans text-xs text-charcoal/40">Competition</p>
        </div>
        <div className="card p-4">
          <FileText size={16} className="text-clay-500 mb-2" />
          <p className="font-display font-bold text-xl text-charcoal">{formFields.length || '—'}</p>
          <p className="font-sans text-xs text-charcoal/40">Form Fields</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 border-b border-sand-200">
        {(['overview', 'apply'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={cn('px-5 py-3 font-sans text-sm font-medium border-b-2 transition-colors capitalize',
              activeTab === tab ? 'border-clay-500 text-clay-600' : 'border-transparent text-charcoal/40 hover:text-charcoal/70')}>
            {tab === 'apply' ? 'Apply Now' : 'Overview'}
          </button>
        ))}
      </div>

      {/* === OVERVIEW TAB === */}
      {activeTab === 'overview' && (
        <div className="space-y-8">
          {/* Enrichment CTA if not enriched */}
          {!grant.enriched && (
            <div className="bg-clay-50 border border-clay-200 rounded-2xl p-6 flex items-center justify-between">
              <div>
                <p className="font-sans font-medium text-clay-700 text-sm">This grant hasn't been fully researched yet</p>
                <p className="font-sans text-xs text-clay-500 mt-1">Click to expand the description, eligibility details, and generate the application form.</p>
              </div>
              <button onClick={enrichGrant} disabled={enriching}
                className="btn-primary text-sm py-2 px-5 flex-shrink-0 flex items-center gap-2">
                {enriching ? <><Loader size={14} className="animate-spin" /> Researching...</> : <><Sparkles size={14} /> Research Grant</>}
              </button>
            </div>
          )}

          {/* Description */}
          <div>
            <h2 className="font-display font-semibold text-xl text-charcoal mb-4">About This Grant</h2>
            <div className="prose-foundher">
              {grant.full_description ? (
                grant.full_description.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)
              ) : (
                <p>{grant.description}</p>
              )}
            </div>
          </div>

          {/* Eligibility */}
          {grant.eligibility_details && (
            <div>
              <h2 className="font-display font-semibold text-xl text-charcoal mb-4">Eligibility Requirements</h2>
              <div className="prose-foundher">
                {grant.eligibility_details.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {/* Required Documents */}
          {grant.required_documents && grant.required_documents.length > 0 && (
            <div>
              <h2 className="font-display font-semibold text-xl text-charcoal mb-4">Required Documents</h2>
              <div className="grid md:grid-cols-2 gap-2">
                {grant.required_documents.map((doc: string, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-sand-50 border border-sand-200 rounded-xl p-3">
                    <CheckCircle size={16} className="text-forest-500 flex-shrink-0" />
                    <span className="font-sans text-sm text-charcoal/80">{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Application Process */}
          {grant.application_process && (
            <div>
              <h2 className="font-display font-semibold text-xl text-charcoal mb-4">How to Apply</h2>
              <div className="prose-foundher">
                {grant.application_process.split('\n\n').map((p: string, i: number) => <p key={i}>{p}</p>)}
              </div>
            </div>
          )}

          {/* External link */}
          <div className="flex flex-wrap gap-3">
            {grant.source_url && (
              <a href={grant.source_url} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center gap-2">
                <ExternalLink size={14} /> Visit Grant Website
              </a>
            )}
            {grant.form_url && (
              <a href={grant.form_url} target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-sm flex items-center gap-2">
                <FileText size={14} /> Official Application Form
              </a>
            )}
            <button onClick={() => setActiveTab('apply')} className="btn-primary text-sm flex items-center gap-2">
              <Send size={14} /> Start Application
            </button>
          </div>
        </div>
      )}

      {/* === APPLY TAB === */}
      {activeTab === 'apply' && (
        <div>
          {submitted ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-forest-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle size={32} className="text-forest-600" />
              </div>
              <h2 className="font-display font-bold text-2xl text-charcoal mb-3">Application Submitted</h2>
              <p className="font-body text-charcoal/60 mb-6 max-w-md mx-auto">
                Your application for <strong>{grant.name}</strong> has been saved. You can view and edit it from your Applications dashboard.
              </p>
              <div className="flex gap-3 justify-center">
                <Link href="/dashboard/applications" className="btn-primary text-sm">View Applications</Link>
                <Link href="/dashboard/grants" className="btn-secondary text-sm">Find More Grants</Link>
              </div>
            </div>
          ) : formFields.length === 0 && !grant.enriched ? (
            <div className="text-center py-16">
              <Sparkles size={32} className="text-clay-400 mx-auto mb-4" />
              <h2 className="font-display font-semibold text-xl text-charcoal mb-3">Application form not yet generated</h2>
              <p className="font-body text-charcoal/60 mb-6 max-w-md mx-auto">
                This grant needs to be researched first to generate the appropriate application form.
              </p>
              <button onClick={enrichGrant} disabled={enriching}
                className="btn-primary text-sm flex items-center gap-2 mx-auto">
                {enriching ? <><Loader size={14} className="animate-spin" /> Generating Form...</> : <><Sparkles size={14} /> Generate Application Form</>}
              </button>
            </div>
          ) : (
            <>
              {/* Form header */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-display font-semibold text-xl text-charcoal">
                    {grant.has_external_form ? 'Application Preparation Form' : 'Grant Application'}
                  </h2>
                  <button onClick={saveDraft} className="font-sans text-xs text-clay-500 hover:text-clay-700">
                    Save Draft
                  </button>
                </div>
                {grant.has_external_form && grant.form_url && (
                  <div className="bg-forest-50 border border-forest-200 rounded-xl p-3 flex items-center gap-3 mb-4">
                    <AlertCircle size={16} className="text-forest-600 flex-shrink-0" />
                    <p className="font-sans text-xs text-forest-700">
                      This grant has an official external form. Complete this preparation form first, then submit through{' '}
                      <a href={grant.form_url} target="_blank" rel="noopener noreferrer" className="underline font-medium">
                        the official portal
                      </a>.
                    </p>
                  </div>
                )}
                <p className="font-sans text-sm text-charcoal/50">
                  Fields marked with <span className="text-clay-500">*</span> are required. Your founder profile data has been pre-filled where applicable.
                </p>
              </div>

              {/* Dynamic form sections */}
              <div className="space-y-4">
                {sections.map(section => {
                  const sectionFields = formFields.filter(f => (f.section || 'General') === section)
                  const isExpanded = expandedSections.has(section)
                  const filledCount = sectionFields.filter(f => formData[f.id]).length

                  return (
                    <div key={section} className="card overflow-hidden">
                      <button onClick={() => toggleSection(section)}
                        className="w-full flex items-center justify-between p-5 text-left hover:bg-sand-50 transition-colors">
                        <div className="flex items-center gap-3">
                          <h3 className="font-display font-semibold text-charcoal">{section}</h3>
                          <span className="font-sans text-xs text-charcoal/40">
                            {filledCount}/{sectionFields.length} completed
                          </span>
                        </div>
                        {isExpanded ? <ChevronUp size={18} className="text-charcoal/40" /> : <ChevronDown size={18} className="text-charcoal/40" />}
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-5 space-y-5 border-t border-sand-100 pt-5">
                          {sectionFields.map(field => (
                            <div key={field.id}>
                              <label className="label">
                                {field.label}
                                {field.required && <span className="text-clay-500 ml-1">*</span>}
                              </label>
                              {field.help_text && (
                                <p className="font-sans text-xs text-charcoal/40 mb-2">{field.help_text}</p>
                              )}

                              {field.type === 'textarea' ? (
                                <textarea className="input min-h-[120px] resize-y" rows={5}
                                  placeholder={field.placeholder}
                                  value={formData[field.id] || ''}
                                  onChange={e => handleFieldChange(field.id, e.target.value)} />
                              ) : field.type === 'select' ? (
                                <select className="input" value={formData[field.id] || ''}
                                  onChange={e => handleFieldChange(field.id, e.target.value)}>
                                  <option value="">Select...</option>
                                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                </select>
                              ) : field.type === 'checkbox' ? (
                                <div className="flex items-center gap-3">
                                  <input type="checkbox" id={field.id}
                                    checked={formData[field.id] || false}
                                    onChange={e => handleFieldChange(field.id, e.target.checked)}
                                    className="w-4 h-4 rounded border-sand-300 text-clay-500" />
                                  <label htmlFor={field.id} className="font-sans text-sm text-charcoal/70 cursor-pointer">
                                    {field.placeholder || 'Yes'}
                                  </label>
                                </div>
                              ) : field.type === 'file' ? (
                                <div className="border-2 border-dashed border-sand-300 rounded-xl p-6 text-center">
                                  <FileText size={24} className="text-charcoal/30 mx-auto mb-2" />
                                  <p className="font-sans text-sm text-charcoal/50">
                                    Prepare this document: <strong>{field.label}</strong>
                                  </p>
                                  <p className="font-sans text-xs text-charcoal/30 mt-1">File upload coming soon — note the requirement for your submission</p>
                                </div>
                              ) : (
                                <input className="input" type={field.type || 'text'}
                                  placeholder={field.placeholder}
                                  value={formData[field.id] || ''}
                                  onChange={e => handleFieldChange(field.id, e.target.value)} />
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Submit bar */}
              <div className="sticky bottom-0 bg-cream border-t border-sand-200 -mx-8 px-8 py-4 mt-8 flex items-center justify-between">
                <button onClick={saveDraft} className="btn-secondary text-sm">Save Draft</button>
                <div className="flex items-center gap-3">
                  {grant.has_external_form && grant.form_url && (
                    <a href={grant.form_url} target="_blank" rel="noopener noreferrer"
                      className="btn-secondary text-sm flex items-center gap-2">
                      <ExternalLink size={14} /> Official Form
                    </a>
                  )}
                  <button onClick={handleSubmit} disabled={submitting}
                    className="btn-primary text-sm flex items-center gap-2">
                    {submitting ? <><Loader size={14} className="animate-spin" /> Submitting...</> : <><Send size={14} /> Submit Application</>}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
