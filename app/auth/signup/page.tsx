import { Suspense } from 'react'
import SignUpForm from './form'

export const dynamic = 'force-dynamic'

export default function SignUpPage() {
  return (
    <Suspense fallback={<div className="animate-pulse h-96 bg-sand-100 rounded-2xl" />}>
      <SignUpForm />
    </Suspense>
  )
}
