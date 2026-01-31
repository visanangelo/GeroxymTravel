'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function AdminError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Admin error:', error.message, error.digest)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center px-4 py-16">
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" />
      </div>
      <h1 className="text-xl font-semibold">Eroare în panoul admin</h1>
      <p className="mt-2 max-w-sm text-center text-sm text-muted-foreground">
        Ceva nu a mers bine. Poți încerca din nou sau reveni la homepage.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Button onClick={reset}>Încearcă din nou</Button>
        <Button asChild variant="outline">
          <Link href="/ro">Acasă</Link>
        </Button>
      </div>
    </div>
  )
}
