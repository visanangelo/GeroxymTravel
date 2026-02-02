'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import {
  Menu,
  X,
  ChevronDown,
  Compass,
  LogIn,
  User as UserIcon,
  LayoutDashboard,
} from 'lucide-react'
import type { InitialAuth } from './types'

type Props = {
  locale?: string
  initialAuth?: InitialAuth
}

const defaultAuth: InitialAuth = { isLoggedIn: false, role: null }

export default function LandingHeader({ locale = 'ro', initialAuth = defaultAuth }: Props) {
  const [authState, setAuthState] = useState<InitialAuth>(initialAuth)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCircuitsDropdownOpen, setIsCircuitsDropdownOpen] = useState(false)
  const [isSejurSubmenuOpen, setIsSejurSubmenuOpen] = useState(false)
  const [isCircuitsMobileExpanded, setIsCircuitsMobileExpanded] = useState(false)
  const [isSejurMobileExpanded, setIsSejurMobileExpanded] = useState(false)

  // Sync when server sends new initialAuth (e.g. after navigation or refresh)
  useEffect(() => {
    setAuthState(initialAuth)
  }, [initialAuth.isLoggedIn, initialAuth.role])

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        setAuthState({ isLoggedIn: false, role: null })
        return
      }
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', session.user.id)
        .maybeSingle()
      const role = (data as { role?: string } | null)?.role === 'admin' ? 'admin' : 'user'
      setAuthState({ isLoggedIn: true, role })
    })
    return () => subscription.unsubscribe()
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          <Link
            href={`/${locale}`}
            className="flex items-center gap-2 font-display text-lg font-semibold text-foreground tracking-tight hover:text-primary transition-colors shrink-0"
            aria-label="Acasă"
          >
            <Compass className="h-8 w-8 text-primary shrink-0" />
            Geroxym Travel
          </Link>

          <nav className="hidden md:flex flex-1 items-center justify-center gap-6 lg:gap-8 min-w-0">
            <Link
              href={`/${locale}`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-label"
            >
              Acasă
            </Link>
            <Link
              href={`/${locale}#despre`}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Despre Noi
            </Link>
          {/* CIRCUITE Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsCircuitsDropdownOpen(true)}
            onMouseLeave={() => { setIsCircuitsDropdownOpen(false); setIsSejurSubmenuOpen(false); }}
          >
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Circuite
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCircuitsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCircuitsDropdownOpen && (
              <>
                <div className="absolute top-full left-0 right-0 h-2" />
                <div className="absolute top-full left-0 mt-2 flex rounded-lg shadow-lg overflow-visible z-50">
                  <div className="w-56 bg-card border border-border rounded-lg py-2">
                    <Link href={`/${locale}/routes?category=intern`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Interne</Link>
                    <Link href={`/${locale}/routes?category=extern`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Externe</Link>
                    <Link href={`/${locale}/routes?category=pelerinaj`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Pelerinaje</Link>
                    <div
                      className="relative"
                      onMouseEnter={() => setIsSejurSubmenuOpen(true)}
                      onMouseLeave={() => setIsSejurSubmenuOpen(false)}
                    >
                      <div className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer">
                        Sejur la mare
                        <ChevronDown className="h-4 w-4 rotate-[-90deg]" aria-hidden />
                      </div>
                      {isSejurSubmenuOpen && (
                        <div
                          className="absolute left-full top-0 ml-0 w-48 bg-card border border-border rounded-lg py-2 shadow-lg"
                          onMouseEnter={() => setIsSejurSubmenuOpen(true)}
                          onMouseLeave={() => setIsSejurSubmenuOpen(false)}
                        >
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=grecia`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Grecia</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=turcia`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Turcia</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=albania`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Albania</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=bulgaria`} className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">Bulgaria</Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
            <Link href={`/${locale}#galerie`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Galerie</Link>
            <Link href={`/${locale}#recenzii`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recenzii</Link>
            <Link href={`/${locale}#contact`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
            <Link href={`/${locale}#inchiriere-autocare`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Închiriere autocare</Link>
            <Button size="sm" asChild className="shrink-0">
              <Link href={`/${locale}/routes`}>Rezervă Acum</Link>
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-4 shrink-0">
            <select className="rounded border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground focus:outline-none focus:ring-2 focus:ring-ring">
              <option value="ro">RO</option>
              <option value="en">EN</option>
            </select>
            {!authState.isLoggedIn ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/login`} className="inline-flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Login
                </Link>
              </Button>
            ) : authState.role === 'admin' ? (
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin" className="inline-flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4" />
                  Open Dashboard
                </Link>
              </Button>
            ) : (
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/${locale}/account`} className="inline-flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  My Account
                </Link>
              </Button>
            )}
          </div>

          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => { setIsMobileMenuOpen(!isMobileMenuOpen); if (isMobileMenuOpen) setIsCircuitsMobileExpanded(false); }} aria-label="Meniu">
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {isMobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border">
            <nav className="flex flex-col gap-4">
              <Link href={`/${locale}`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Acasă</Link>
              <Link href={`/${locale}#despre`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Despre Noi</Link>
              <div>
                <button onClick={() => { setIsCircuitsMobileExpanded(!isCircuitsMobileExpanded); if (isCircuitsMobileExpanded) setIsSejurMobileExpanded(false); }} className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Circuite
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCircuitsMobileExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isCircuitsMobileExpanded && (
                  <div className="pl-4 mt-2 space-y-1 border-l-2 border-border">
                    <Link href={`/${locale}/routes?category=intern`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Interne</Link>
                    <Link href={`/${locale}/routes?category=extern`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Externe</Link>
                    <Link href={`/${locale}/routes?category=pelerinaj`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Pelerinaje</Link>
                    <div>
                      <button onClick={() => setIsSejurMobileExpanded(!isSejurMobileExpanded)} className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5 text-left">
                        Sejur la mare
                        <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isSejurMobileExpanded ? 'rotate-180' : ''}`} />
                      </button>
                      {isSejurMobileExpanded && (
                        <div className="pl-4 mt-1 space-y-1 border-l-2 border-border/60">
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=grecia`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Grecia</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=turcia`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Turcia</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=albania`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Albania</Link>
                          <Link href={`/${locale}/routes?category=sejur_mare&subcategory=bulgaria`} className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>Bulgaria</Link>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
              <Link href={`/${locale}#galerie`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Galerie</Link>
              <Link href={`/${locale}#recenzii`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recenzii</Link>
              <Link href={`/${locale}#contact`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</Link>
              <Link href={`/${locale}#inchiriere-autocare`} onClick={() => setIsMobileMenuOpen(false)} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Închiriere autocare</Link>
              {!authState.isLoggedIn ? (
                <Button variant="ghost" size="sm" className="w-fit inline-flex items-center gap-2" asChild>
                  <Link href={`/${locale}/login`} onClick={() => setIsMobileMenuOpen(false)}>
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                </Button>
              ) : authState.role === 'admin' ? (
                <Button variant="ghost" size="sm" className="w-fit inline-flex items-center gap-2" asChild>
                  <Link href="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                    <LayoutDashboard className="h-4 w-4" />
                    Open Dashboard
                  </Link>
                </Button>
              ) : (
                <Button variant="ghost" size="sm" className="w-fit inline-flex items-center gap-2" asChild>
                  <Link href={`/${locale}/account`} onClick={() => setIsMobileMenuOpen(false)}>
                    <UserIcon className="h-4 w-4" />
                    My Account
                  </Link>
                </Button>
              )}
              <Button size="sm" className="w-fit" asChild>
                <Link href={`/${locale}/routes`} onClick={() => setIsMobileMenuOpen(false)}>Rezervă Acum</Link>
              </Button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

