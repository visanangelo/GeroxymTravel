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
import type { InitialAuth } from './LandingPageClient'

type Props = {
  locale?: string
  initialAuth?: InitialAuth
  onNavClick: (e: React.MouseEvent<HTMLAnchorElement>, target: string) => void
  onScrollToTop: () => void
}

const defaultAuth: InitialAuth = { isLoggedIn: false, role: null }

export default function LandingHeader({ locale = 'ro', initialAuth = defaultAuth, onNavClick, onScrollToTop }: Props) {
  const [authState, setAuthState] = useState<InitialAuth>(initialAuth)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isCircuitsDropdownOpen, setIsCircuitsDropdownOpen] = useState(false)
  const [isCircuitsMobileExpanded, setIsCircuitsMobileExpanded] = useState(false)

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <button
            onClick={onScrollToTop}
            className="flex items-center gap-2 font-display text-lg font-semibold text-foreground tracking-tight hover:text-primary transition-colors cursor-pointer"
            aria-label="Acasă"
          >
            <Compass className="h-8 w-8 text-primary shrink-0" />
            Geroxym Travel
          </button>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#home"
              onClick={(e) => onNavClick(e, 'home')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors tracking-label"
            >
              Acasă
            </a>
            <a
              href="#despre"
              onClick={(e) => onNavClick(e, 'despre')}
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Despre Noi
            </a>
          {/* CIRCUITE Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setIsCircuitsDropdownOpen(true)}
            onMouseLeave={() => setIsCircuitsDropdownOpen(false)}
          >
            <button className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1">
              Circuite
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCircuitsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {isCircuitsDropdownOpen && (
              <>
                <div className="absolute top-full left-0 right-0 h-2" />
                <div className="absolute top-full left-0 mt-2 w-56 bg-card border border-border rounded-lg shadow-lg overflow-hidden z-50">
                  <div className="py-2">
                    {['Ture în țară', 'Ture internaționale', 'Excursii de o zi', 'Circuitul Mării Negre', 'Transilvania', 'București & Regiuni'].map((item) => (
                      <a key={item} href="#" className="block px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">{item}</a>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
            <a href="#galerie" onClick={(e) => onNavClick(e, 'galerie')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Galerie</a>
            <a href="#recenzii" onClick={(e) => onNavClick(e, 'recenzii')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recenzii</a>
            <a href="#contact" onClick={(e) => onNavClick(e, 'contact')} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
            <Button size="sm" asChild>
              <Link href={`/${locale}/routes`}>Rezervă Acum</Link>
            </Button>
          </nav>

          <div className="hidden md:flex items-center gap-4">
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
              <a href="#home" onClick={(e) => { onNavClick(e, 'home'); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Acasă</a>
              <a href="#despre" onClick={(e) => { onNavClick(e, 'despre'); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Despre Noi</a>
              <div>
                <button onClick={() => setIsCircuitsMobileExpanded(!isCircuitsMobileExpanded)} className="w-full flex items-center justify-between text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-2">
                  Circuite
                  <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isCircuitsMobileExpanded ? 'rotate-180' : ''}`} />
                </button>
                {isCircuitsMobileExpanded && (
                  <div className="pl-4 mt-2 space-y-2 border-l-2 border-border">
                    {['Ture în țară', 'Ture internaționale', 'Excursii de o zi', 'Circuitul Mării Negre', 'Transilvania', 'București & Regiuni'].map((item) => (
                      <a key={item} href="#" className="block text-sm font-medium text-muted-foreground hover:text-foreground transition-colors py-1.5" onClick={() => setIsMobileMenuOpen(false)}>{item}</a>
                    ))}
                  </div>
                )}
              </div>
              <a href="#galerie" onClick={(e) => { onNavClick(e, 'galerie'); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Galerie</a>
              <a href="#recenzii" onClick={(e) => { onNavClick(e, 'recenzii'); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Recenzii</a>
              <a href="#contact" onClick={(e) => { onNavClick(e, 'contact'); setIsMobileMenuOpen(false); }} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">Contact</a>
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

