'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { Button } from '@/components/ui/button'

type Props = {
  currentPeriod: string
}

export default function PeriodSwitcher({ currentPeriod }: Props) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handlePeriodChange = (period: string) => {
    startTransition(() => {
      router.push(`/admin?period=${period}`)
      router.refresh() // Force server re-fetch
    })
  }

  return (
    <div className="flex gap-2">
      <Button
        variant={currentPeriod === 'week' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePeriodChange('week')}
        disabled={isPending}
      >
        {isPending && currentPeriod !== 'week' ? 'Loading...' : 'This Week'}
      </Button>
      <Button
        variant={currentPeriod === 'next' ? 'default' : 'outline'}
        size="sm"
        onClick={() => handlePeriodChange('next')}
        disabled={isPending}
      >
        {isPending && currentPeriod !== 'next' ? 'Loading...' : 'Next Week'}
      </Button>
    </div>
  )
}
