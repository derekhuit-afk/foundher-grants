import { Suspense } from 'react'
import OnboardingForm from './form'

export const dynamic = 'force-dynamic'

export default function OnboardingPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-cream flex items-center justify-center"><div className="animate-pulse h-96 w-full max-w-2xl bg-sand-100 rounded-2xl" /></div>}>
      <OnboardingForm />
    </Suspense>
  )
}
