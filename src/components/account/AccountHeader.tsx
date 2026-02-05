'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Compass, LogOut, Menu, User, Ticket, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AccountTab } from './AccountClient'

type Props = {
  locale: string
  currentTab: AccountTab
  onTabChange: (tab: AccountTab) => void
}

export default function AccountHeader({ locale, currentTab, onTabChange }: Props) {
  const [mobileOpen, setMobileOpen] = useState(false)

  async function handleLogout() {
    setMobileOpen(false)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
    // Full page navigation so server sees cleared session
    window.location.href = `/${locale}/login`
  }

  const navBtn = (t: AccountTab, label: string) => (
    <button
      type="button"
      onClick={() => {
        onTabChange(t)
        setMobileOpen(false)
      }}
      className={cn(
        'text-sm font-medium transition-colors hover:text-foreground whitespace-nowrap',
        currentTab === t
          ? 'text-foreground border-b-2 border-primary pb-0.5'
          : 'text-muted-foreground'
      )}
    >
      {label}
    </button>
  )

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between gap-2 px-4">
        {/* Brand */}
        <Link
          href={`/${locale}`}
          className="flex shrink-0 items-center gap-2 font-semibold text-foreground hover:text-primary transition-colors"
        >
          <Compass className="h-6 w-6 text-primary" />
          <span className="hidden sm:inline">Geroxym</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-4 md:flex md:gap-6">
          <Link
            href={`/${locale}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
          >
            View site
          </Link>
          <div className="h-4 w-px bg-border" aria-hidden />
          {navBtn('overview', 'My Account')}
          {navBtn('bookings', 'My Bookings')}
          <div className="h-4 w-px bg-border" aria-hidden />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="mr-2 h-4 w-4" />
            <span className="whitespace-nowrap">Log out</span>
          </Button>
        </nav>

        {/* Mobile: hamburger + sheet */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="md:hidden shrink-0" aria-label="Menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-[280px]">
            <SheetHeader>
              <SheetTitle className="sr-only">Account menu</SheetTitle>
            </SheetHeader>
            <div className="mt-6 flex flex-col gap-1">
              <Link
                href={`/${locale}`}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <ExternalLink className="h-4 w-4" />
                View site
              </Link>
              <button
                type="button"
                onClick={() => {
                  onTabChange('overview')
                  setMobileOpen(false)
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
              >
                <User className="h-4 w-4" />
                My Account
              </button>
              <button
                type="button"
                onClick={() => {
                  onTabChange('bookings')
                  setMobileOpen(false)
                }}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium hover:bg-muted"
              >
                <Ticket className="h-4 w-4" />
                My Bookings
              </button>
              <div className="my-2 h-px bg-border" />
              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
