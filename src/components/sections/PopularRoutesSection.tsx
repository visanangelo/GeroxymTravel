import Image from 'next/image'
import Link from 'next/link'
import { formatCurrency } from '@/lib/utils'
import type { HomepageRoute } from '@/lib/homepage-routes'

const FALLBACK_IMAGE = '/images/img_dest.avif'

type Props = {
  locale: string
  routes: HomepageRoute[]
}

export default function PopularRoutesSection({ locale, routes }: Props) {
  if (routes.length === 0) return null

  return (
    <section id="galerie" className="relative py-24 px-4 md:px-6 animate-on-scroll opacity-0 transition-all duration-1000 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="accent-line" aria-hidden />
            <p className="font-display text-primary text-xs uppercase tracking-cinematic font-semibold">
              Explorează
            </p>
          </div>
          <h2 className="text-impact font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 text-balance leading-tight">
            Rute Populare
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Alege destinația ta preferată și rezervă biletul.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {routes.map((route) => (
            <Link
              key={route.id}
              href={`/${locale}/routes/${route.id}`}
              className="route-card group flex flex-col bg-card rounded-xl overflow-hidden border border-border"
            >
              <div className="relative h-64 overflow-hidden">
                {route.image_url ? (
                  <img
                    src={route.image_url}
                    alt={`${route.origin} → ${route.destination}`}
                    className="route-card-image h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <Image
                    src={FALLBACK_IMAGE}
                    alt={`${route.origin} → ${route.destination}`}
                    fill
                    className="route-card-image object-cover"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    quality={85}
                    loading="lazy"
                  />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="font-display text-lg font-semibold text-white drop-shadow-md tracking-tight">
                    {route.origin} → {route.destination}
                  </h3>
                </div>
              </div>
              <div className="flex flex-1 flex-col p-6">
                <div className="flex items-end justify-between pt-2 border-t border-border mt-auto">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pornind de la</p>
                    <span className="text-2xl font-bold text-primary">
                      {formatCurrency(route.price_cents / 100, route.currency)}
                    </span>
                    <span className="text-sm text-muted-foreground">/pers</span>
                  </div>
                  <span className="route-card-arrow inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:text-primary">
                    Vezi detalii
                    <span aria-hidden>→</span>
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

