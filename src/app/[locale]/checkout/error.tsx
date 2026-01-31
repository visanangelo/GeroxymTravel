'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

type Props = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function CheckoutError({ error, reset }: Props) {
  useEffect(() => {
    console.error('Checkout error:', error.message, error.digest)
  }, [error])

  return (
    <div className="container mx-auto max-w-md px-4 py-16 text-center">
      <div className="mb-6 flex justify-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertCircle className="h-7 w-7 text-destructive" />
        </div>
      </div>
      <h1 className="text-xl font-semibold">Ceva nu a mers bine</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Pagina de checkout nu s-a putut încărca. Poți încerca din nou sau reveni la cont.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Button onClick={reset} variant="default">
          Încearcă din nou
        </Button>
        <Button asChild variant="outline">
          <Link href="/ro/account">Mergi la Cont</Link>
        </Button>
      </div>
    </div>
  )
}
