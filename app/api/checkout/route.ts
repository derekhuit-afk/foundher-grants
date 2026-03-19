import { NextRequest, NextResponse } from 'next/server'
import { stripe, PLANS } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(req: NextRequest) {
  const supabase = createAdminClient()
  const { userId, tier } = await req.json()

  if (!userId || !tier) return NextResponse.json({ error: 'Missing params' }, { status: 400 })

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).single()
  if (!profile) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  const plan = tier === 'tier2' ? PLANS.tier2 : PLANS.tier1

  // Get or create Stripe customer
  let customerId = profile.stripe_customer_id
  if (!customerId) {
    const customer = await stripe.customers.create({
      email: profile.email,
      name: profile.full_name || undefined,
      metadata: { userId },
    })
    customerId = customer.id
    await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
  }

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{
      price: plan.priceId,
      quantity: 1,
    }],
    subscription_data: tier === 'tier2' ? {
      metadata: { userId, tier: 'tier2', minMonths: '12' }
    } : {
      metadata: { userId, tier: 'tier1' }
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard?upgraded=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/pricing`,
    metadata: { userId, tier },
  })

  return NextResponse.json({ url: session.url })
}
