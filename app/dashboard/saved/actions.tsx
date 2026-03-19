'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ChevronDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

const STATUSES = ['saved', 'applied', 'won', 'declined', 'expired']

export default function SavedGrantActions({ savedId, currentStatus }: { savedId: string; currentStatus: string }) {
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const update = async (status: string) => {
    const supabase = createClient()
    await supabase.from('saved_grants').update({ status }).eq('id', savedId)
    setOpen(false)
    router.refresh()
  }

  const remove = async () => {
    const supabase = createClient()
    await supabase.from('saved_grants').delete().eq('id', savedId)
    setOpen(false)
    router.refresh()
  }

  return (
    <div className="relative">
      <button onClick={() => setOpen(!open)}
        className="flex items-center gap-1 font-sans text-xs text-charcoal/50 hover:text-charcoal border border-sand-200 rounded-lg px-2 py-1.5 hover:border-sand-300 transition-colors">
        {currentStatus} <ChevronDown size={11} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-sand-200 rounded-xl shadow-lg z-10 py-1 min-w-32">
          {STATUSES.map(s => (
            <button key={s} onClick={() => update(s)}
              className={`w-full text-left px-4 py-2 font-sans text-xs hover:bg-sand-50 transition-colors capitalize
                ${s === currentStatus ? 'text-clay-500 font-medium' : 'text-charcoal/70'}`}>
              {s}
            </button>
          ))}
          <div className="border-t border-sand-100 mt-1 pt-1">
            <button onClick={remove} className="w-full text-left px-4 py-2 font-sans text-xs text-clay-500 hover:bg-clay-50 transition-colors">
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
