import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount)
}

export function formatDate(date: string | Date) {
  return new Date(date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
}

export function daysUntil(date: string | Date) {
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function getMatchScoreColor(score: number) {
  if (score >= 80) return 'text-forest-600'
  if (score >= 60) return 'text-sand-600'
  return 'text-clay-500'
}

export function getMatchScoreLabel(score: number) {
  if (score >= 80) return 'Strong Match'
  if (score >= 60) return 'Good Match'
  if (score >= 40) return 'Possible Match'
  return 'Review Eligibility'
}

export function computeMatchScore(grant: any, profile: any): number {
  if (!profile) return 50
  let score = 50
  const certs = profile.certifications_held || []
  const eligible = grant.eligible_for || []
  
  if (eligible.includes('women_owned') && profile.founder_pronouns?.includes('she')) score += 20
  if (eligible.includes('indigenous') && profile.tribal_affiliation) score += 25
  if (eligible.includes('wosb') && certs.includes('WOSB')) score += 15
  if (eligible.includes('wbe') && certs.includes('WBE')) score += 15
  if (eligible.includes('tribal_8a') && certs.includes('Tribal 8(a)')) score += 20
  if (grant.states_eligible?.length > 0 && !grant.states_eligible.includes(profile.state)) score -= 30
  if (grant.rural_only && profile.rural_urban !== 'rural') score -= 20
  
  return Math.min(100, Math.max(10, score))
}
