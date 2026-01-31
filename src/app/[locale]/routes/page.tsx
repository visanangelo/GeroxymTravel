import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import RoutesListClient from './RoutesListClient'
import { getFilteredRoutes } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 60

type Props = {
  params: Promise<{ locale: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params
  const t = locale === 'ro' ? 'ro' : 'en'
  const titles = {
    ro: 'Rute disponibile | Geroxym Travel',
    en: 'Available routes | Geroxym Travel',
  }
  const descriptions = {
    ro: 'Caută și rezervă biletul pentru următoarea ta călătorie. Rute de la Drobeta-Turnu Severin.',
    en: 'Search and book your next trip. Routes from Drobeta-Turnu Severin.',
  }
  return {
    title: titles[t],
    description: descriptions[t],
    openGraph: {
      title: titles[t],
      description: descriptions[t],
      locale: locale === 'ro' ? 'ro_RO' : 'en_US',
    },
  }
}

export default async function RoutesPage({ params }: Props) {
  const { locale } = await params

  // Single server fetch: all active future routes (no URL params – no refresh on filter)
  const { routes: initialRoutes, error } = await getFilteredRoutes({})

  if (error) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <Card className="border-destructive/50 bg-destructive/10">
            <CardContent className="pt-6">
              <p className="text-destructive">Eroare la încărcarea rute: {error}</p>
              <Link href={`/${locale}`} className="text-primary underline mt-2 inline-block">
                Înapoi la prima pagină
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-background py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
          >
            <span aria-hidden>←</span>
            Înapoi la prima pagină
          </Link>
          <div className="flex flex-col gap-2 mb-3">
            <div className="accent-line" aria-hidden />
            <p className="font-display text-primary text-xs uppercase tracking-cinematic font-semibold">
              Explorează
            </p>
          </div>
          <h1 className="text-impact font-display text-2xl sm:text-3xl md:text-4xl text-foreground leading-tight">
            Rute disponibile
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-2xl">
            Caută și rezervă biletul pentru următoarea ta călătorie.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <RoutesListClient locale={locale} initialRoutes={initialRoutes} />
      </div>
    </div>
  )
}
