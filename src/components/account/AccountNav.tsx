'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Home, Route, Ticket, User, LogOut } from 'lucide-react'

type Props = {
  locale: string
  /** 'account' = show My Bookings link; 'my-bookings' = show Account link */
  variant: 'account' | 'my-bookings'
}

export default function AccountNav({ locale, variant }: Props) {
  const router = useRouter()

  async function handleLogout() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/${locale}`} className="inline-flex items-center gap-2">
          <Home className="h-4 w-4" />
          Homepage
        </Link>
      </Button>
      <Button variant="ghost" size="sm" asChild>
        <Link href={`/${locale}/routes`} className="inline-flex items-center gap-2">
          <Route className="h-4 w-4" />
          Rute
        </Link>
      </Button>
      {variant === 'account' ? (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/account?tab=bookings`} className="inline-flex items-center gap-2">
            <Ticket className="h-4 w-4" />
            My Bookings
          </Link>
        </Button>
      ) : (
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/${locale}/account`} className="inline-flex items-center gap-2">
            <User className="h-4 w-4" />
            My Account
          </Link>
        </Button>
      )}
      <Button variant="ghost" size="sm" onClick={handleLogout} className="inline-flex items-center gap-2">
        <LogOut className="h-4 w-4" />
        Logout
      </Button>
    </div>
  )
}
