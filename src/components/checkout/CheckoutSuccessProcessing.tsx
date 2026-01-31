'use client'

import { useEffect } from 'react'
import Link from 'next/link'

type Props = {
  locale: string
}

export function CheckoutSuccessProcessing({ locale }: Props) {
  useEffect(() => {
    const interval = setInterval(() => {
      window.location.reload()
    }, 3000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20 flex items-center justify-center">
      <div className="text-center space-y-4 max-w-md px-4">
        <div className="animate-pulse rounded-full bg-primary/20 h-16 w-16 mx-auto" />
        <h1 className="text-xl font-semibold">Processing your payment...</h1>
        <p className="text-muted-foreground text-sm">
          Your payment was received. We are confirming and assigning your seats. This page will
          update automatically.
        </p>
        <p className="text-xs text-muted-foreground">
          If it takes more than a minute, check your email or{' '}
          <Link href={`/${locale}/account?tab=bookings`} className="text-primary underline">
            My Bookings
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
