import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-04-10',
  typescript: true,
})

export const PLANS = {
  tier1: {
    name: 'Grant Database',
    price: 29,
    priceId: process.env.STRIPE_TIER1_PRICE_ID!,
    description: 'Full access to the curated grant database',
    features: [
      'Searchable database of 300+ grants',
      'Women-owned & Indigenous filters',
      'Deadline tracking & alerts',
      'Weekly grant digest emails',
      'Save & track up to 50 grants',
      'Certification roadmap',
    ],
  },
  tier2: {
    name: 'Grant Concierge',
    price: 199,
    priceId: process.env.STRIPE_TIER2_PRICE_ID!,
    description: 'AI-powered done-for-you grant writing',
    features: [
      'Everything in Grant Database',
      'AI writes your full applications',
      'Up to 5 applications per month',
      'Eligibility validation per grant',
      'Submission-ready packages delivered',
      'Step-by-step submission guides',
      'Application outcome tracking',
      'Priority support',
    ],
    minMonths: 12,
  },
}
