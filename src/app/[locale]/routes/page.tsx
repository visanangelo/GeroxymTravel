import type { Metadata } from 'next'
import { Card, CardContent } from '@/components/ui/card'
import Link from 'next/link'
import RoutesListClient from './RoutesListClient'
import { getFilteredRoutes } from './actions'

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

type PageProps = Props & { searchParams?: Promise<{ category?: string; subcategory?: string }> }

/** Validează și sanitizează parametrii din URL */
function validateURLParams(params: { category?: string; subcategory?: string } | undefined) {
  const validCategories = new Set(['intern', 'extern', 'pelerinaj', 'sejur_mare'])
  const validSubcategories = new Set(['grecia', 'turcia', 'albania', 'bulgaria'])
  
  const category = params?.category && validCategories.has(params.category) ? params.category : ''
  const subcategory = params?.subcategory && validSubcategories.has(params.subcategory) ? params.subcategory : ''
  
  return { category, subcategory }
}

export default async function RoutesPage({ params, searchParams }: PageProps) {
  const { locale } = await params
  const sp = (await searchParams?.catch(() => ({}))) as { category?: string; subcategory?: string } | undefined
  
  // Validare sigură a parametrilor din URL
  const { category: initialCategory, subcategory: initialSubcategory } = validateURLParams(sp)

  /** Single load: all active routes (up to ROUTES_INITIAL_LIMIT). Filter/sort is client-side only. */
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
      {/* Hero: subtle gradient + clear hierarchy */}
      <div className="relative border-b border-border bg-gradient-to-b from-muted/40 to-background py-10 sm:py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav aria-label="Breadcrumb" className="mb-6">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <span aria-hidden>←</span>
              Acasă
            </Link>
          </nav>
          <div className="flex flex-col gap-5">
            <span className="font-display text-primary text-xs uppercase tracking-[0.2em] font-semibold">
              Circuite
            </span>
            <h1 className="font-syne font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.5rem] text-foreground leading-tight tracking-tight">
              Alege destinatia ta
            </h1>
            <p className="text-base sm:text-lg text-muted-foreground max-w-2xl">
              Caută și rezervă biletul pentru următoarea călătorie. Filtrează după categorie, dată sau destinație.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        <RoutesListClient locale={locale} initialRoutes={initialRoutes} initialCategory={initialCategory} initialSubcategory={initialSubcategory} />
      </div>
    </div>
  )
}
