import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/service'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { MapPin, Calendar, Clock, Users, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import RouteBookingForm from '@/components/routes/RouteBookingForm'

export const dynamic = 'force-dynamic'
export const revalidate = 30 // Revalidate route details every 30 seconds

type Props = {
  params: Promise<{ locale: string; id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, id } = await params
  const supabase = await createClient()
  const { data: route } = await supabase
    .from('routes')
    .select('origin, destination')
    .eq('id', id)
    .single()

  const t = locale === 'ro' ? 'ro' : 'en'
  const titles = {
    ro: route ? `${route.origin} → ${route.destination} | Geroxym Travel` : 'Detalii rută | Geroxym Travel',
    en: route ? `${route.origin} → ${route.destination} | Geroxym Travel` : 'Route details | Geroxym Travel',
  }
  const descriptions = {
    ro: route ? `Rezervă bilet pentru ${route.origin} - ${route.destination}. Călătorește cu Geroxym Travel.` : 'Rezervă bilet pentru această rută.',
    en: route ? `Book your ticket for ${route.origin} - ${route.destination}. Travel with Geroxym Travel.` : 'Book your ticket for this route.',
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

export default async function RouteDetailsPage({ params }: Props) {
  const { locale, id } = await params
  const supabase = await createClient()
  const serviceClient = createServiceClient()

  // Fetch route and tickets in parallel (avoid N+1)
  const [routeResult, ticketsResult] = await Promise.all([
    supabase.from('routes').select('*').eq('id', id).single(),
    serviceClient.from('tickets').select('seat_no').eq('route_id', id).eq('status', 'paid'),
  ])

  const { data: route, error: routeError } = routeResult
  if (routeError || !route) {
    notFound()
  }

  const tickets = ticketsResult.data ?? []
  const assignedSeatNos = new Set((tickets as Array<{ seat_no: number }>).map((t) => t.seat_no))
  const onlineSold = Array.from(assignedSeatNos).filter(
    (seatNo) => seatNo <= route.capacity_online
  ).length
  const onlineRemaining = Math.max(0, route.capacity_online - onlineSold)
  const offlineReserved = Array.from(assignedSeatNos).filter(
    (seatNo) => seatNo > route.capacity_online
  ).length

  // Get current user and customer data if logged in
  const { data: { user } } = await supabase.auth.getUser()
  let customerData = null
  if (user) {
    const { data: customer } = await supabase
      .from('customers')
      .select('full_name, email, phone')
      .eq('user_id', user.id)
      .single()
    customerData = customer
  }

  const departDate = new Date(route.depart_at)
  const hasCoverImage = !!route.image_url

  return (
    <div className="min-h-screen bg-background">
      {/* Hero: cover image full-width with overlay (tourism-routes style) */}
      <section className="relative w-full overflow-hidden">
        {hasCoverImage ? (
          <>
            <div className="relative h-[42vh] min-h-[280px] max-h-[420px] w-full bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={route.image_url!}
                alt=""
                className="absolute inset-0 h-full w-full object-cover object-center"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-foreground/90 via-foreground/40 to-transparent" />
              <div className="absolute inset-0 flex flex-col justify-end p-6 text-primary-foreground sm:p-8 md:p-10">
                <Link
                  href={`/${locale}/routes`}
                  className="absolute left-4 top-4 flex items-center gap-2 rounded-md bg-background/20 px-3 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm transition hover:bg-background/30 sm:left-6 sm:top-6"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Înapoi la rute
                </Link>
                <div className="space-y-2">
                  <h1 className="text-impact-dark font-display text-xl sm:text-2xl md:text-3xl lg:text-4xl text-primary-foreground leading-tight">
                    {route.origin} → {route.destination}
                  </h1>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-primary-foreground/90">
                    <span className="flex items-center gap-1.5">
                      <Calendar className="h-4 w-4" />
                      {departDate.toLocaleDateString(locale, { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Clock className="h-4 w-4" />
                      {departDate.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' })}
                    </span>
                    <span className="font-semibold text-primary-foreground">
                      {formatCurrency(route.price_cents / 100, route.currency)} <span className="font-normal opacity-80">/ bilet</span>
                    </span>
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge
                      variant={route.status === 'active' ? 'default' : route.status === 'cancelled' ? 'destructive' : 'secondary'}
                      className="font-medium"
                    >
                      {route.status}
                    </Badge>
                    {route.status === 'active' && (
                      <span className="text-sm text-primary-foreground/80">
                        {onlineRemaining} locuri disponibile
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="border-b border-border bg-card px-4 py-6 sm:px-6">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              <Button variant="ghost" size="sm" className="w-fit text-foreground" asChild>
                <Link href={`/${locale}/routes`}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Înapoi la rute
                </Link>
              </Button>
              <h1 className="text-impact font-display text-xl sm:text-2xl md:text-3xl text-foreground leading-tight">
                {route.origin} → {route.destination}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {departDate.toLocaleDateString(locale, { dateStyle: 'full' })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" />
                  {departDate.toLocaleTimeString(locale, { timeStyle: 'short' })}
                </span>
                <span className="font-semibold text-primary">
                  {formatCurrency(route.price_cents / 100, route.currency)} / bilet
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-5 lg:gap-10">
          <div className="space-y-8 lg:col-span-3">
            <Card className="border-border bg-card rounded-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <MapPin className="h-5 w-5 text-primary" />
                  Detalii călătorie
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground">Preț</div>
                    <div className="text-lg font-bold text-primary">
                      {formatCurrency(route.price_cents / 100, route.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">per bilet</div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground">Disponibile</div>
                    <div className="text-lg font-bold text-foreground">{onlineRemaining}</div>
                    <div className="text-xs text-muted-foreground">locuri online</div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground">Capacitate</div>
                    <div className="text-lg font-bold text-foreground">{route.capacity_online}</div>
                    <div className="text-xs text-muted-foreground">online</div>
                  </div>
                  <div className="rounded-lg border border-border bg-muted/50 p-3">
                    <div className="text-xs font-medium text-muted-foreground">Vândute</div>
                    <div className="text-lg font-bold text-foreground">{onlineSold}</div>
                    <div className="text-xs text-muted-foreground">bilete</div>
                  </div>
                </div>
                {offlineReserved > 0 && (
                  <p className="text-sm text-muted-foreground">
                    {offlineReserved} locuri rezervate pentru vânzare offline.
                  </p>
                )}
                {onlineRemaining === 0 && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-destructive">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span className="font-medium">Ruta este epuizată.</span>
                  </div>
                )}
              </CardContent>
            </Card>

            {route.description && (
              <Card className="border-border bg-card rounded-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Despre această rută</CardTitle>
                </CardHeader>
                <CardContent>
                  <div
                    className="prose prose-sm max-w-none text-foreground [&_ul]:list-disc [&_ol]:list-decimal [&_a]:text-primary [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: route.description }}
                  />
                </CardContent>
              </Card>
            )}
          </div>

          <div className="lg:col-span-2">
            <div className="lg:sticky lg:top-6">
              <Card className="border-border bg-card rounded-xl">
                <CardHeader>
                  <CardTitle className="text-foreground">Rezervă bilete</CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Alege numărul de bilete și finalizează plata.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {route.status !== 'active' ? (
                    <div className="space-y-4 text-center">
                      <div className="rounded-lg border border-border bg-muted/50 p-4">
                        <p className="font-medium text-muted-foreground">
                          {route.status === 'cancelled' && 'Ruta a fost anulată.'}
                          {route.status === 'draft' && 'Ruta nu este încă disponibilă pentru rezervare.'}
                        </p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {route.status === 'cancelled' && 'Explorează alte rute.'}
                          {route.status === 'draft' && 'Revino mai târziu.'}
                        </p>
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/${locale}/routes`}>Explorează rute</Link>
                      </Button>
                    </div>
                  ) : onlineRemaining > 0 ? (
                    <RouteBookingForm
                      locale={locale}
                      routeId={route.id}
                      priceCents={route.price_cents}
                      currency={route.currency}
                      maxQuantity={Math.min(onlineRemaining, 10)}
                      customerData={customerData}
                    />
                  ) : (
                    <div className="space-y-4 text-center">
                      <p className="text-muted-foreground">Nu sunt bilete disponibile.</p>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/${locale}/routes`}>Explorează rute</Link>
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
