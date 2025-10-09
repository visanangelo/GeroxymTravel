'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Menu, X, Globe } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { cn } from '@/lib/utils'

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const t = useTranslations('navigation')
  const locale = useLocale()

  const navigation = [
    { name: t('home'), href: `/${locale}` },
    { name: t('destinations'), href: `/${locale}/destinations` },
    { name: t('tours'), href: `/${locale}/tours` },
    { name: t('about'), href: `/${locale}/about` },
    { name: t('contact'), href: `/${locale}/contact` },
  ]

  const toggleLanguage = () => {
    const newLocale = locale === 'ro' ? 'en' : 'ro'
    window.location.href = `/${newLocale}`
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">G</span>
            </div>
            <span className="font-bold text-xl font-montserrat">Geroxym Travel</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleLanguage}
              className="flex items-center space-x-1"
            >
              <Globe className="h-4 w-4" />
              <span>{locale.toUpperCase()}</span>
            </Button>
            <Button size="sm">Rezervă Acum</Button>
          </div>

          {/* Mobile Menu */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Deschide meniul</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[300px] sm:w-[400px]">
              <div className="flex flex-col space-y-4 mt-4">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-lg font-medium hover:text-primary transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t">
                  <Button
                    variant="ghost"
                    onClick={toggleLanguage}
                    className="w-full justify-start"
                  >
                    <Globe className="h-4 w-4 mr-2" />
                    Schimbă în {locale === 'ro' ? 'English' : 'Română'}
                  </Button>
                  <Button className="w-full mt-2">Rezervă Acum</Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}

