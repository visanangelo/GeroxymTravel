'use client'

import { usePathname } from 'next/navigation'
import LandingHeader from './LandingHeader'
import type { InitialAuth } from './LandingPageClient'

type Props = {
  locale: string
  initialAuth: InitialAuth
  children: React.ReactNode
}

export default function SiteLayoutWithHeader({ locale, initialAuth, children }: Props) {
  const pathname = usePathname()
  
  // Pagini care au propriul header și nu trebuie să arate LandingHeader
  const pagesWithOwnHeader = ['/account', '/admin']
  const shouldShowLandingHeader = !pagesWithOwnHeader.some(path => 
    pathname?.includes(path)
  )

  return (
    <>
      {shouldShowLandingHeader && (
        <LandingHeader locale={locale} initialAuth={initialAuth} />
      )}
      <main className={shouldShowLandingHeader ? 'min-h-screen pt-16' : 'min-h-screen'}>
        {children}
      </main>
    </>
  )
}
