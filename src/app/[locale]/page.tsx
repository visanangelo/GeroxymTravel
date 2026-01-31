import dynamic from 'next/dynamic'
import { createClient } from '@/lib/supabase/server'
import HeroSection from '@/components/sections/HeroSection'
import SearchSection from '@/components/sections/SearchSection'
import PopularRoutesSection from '@/components/sections/PopularRoutesSection'
import AboutSection from '@/components/sections/AboutSection'
import LandingPageClient from '@/components/layout/LandingPageClient'
import { getHomepagePopularRoutes } from '@/lib/homepage-routes'

// Lazy load below-the-fold sections to reduce initial JS bundle
const ParallaxSection = dynamic(() => import('@/components/sections/ParallaxSection'), {
  ssr: true,
  loading: () => (
    <section className="relative h-[80vh] md:h-[70vh] overflow-hidden bg-background">
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl">
          <h3 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Experiențe de neuitat
          </h3>
        </div>
      </div>
    </section>
  ),
})

// Lazy load testimonials (below the fold)
const TestimonialsSection = dynamic(() => import('@/components/sections/TestimonialsSection'), {
  ssr: true,
})

// FooterSection is a client component, but it handles its own navigation internally
// No need to pass props from server component
const FooterSection = dynamic(() => import('@/components/sections/FooterSection'), {
  ssr: true,
})

type Props = {
  params: Promise<{ locale: string }>
}

export default async function GeroxyMTravelPage({ params }: Props) {
  const { locale } = await params
  const [popularRoutes, supabase] = await Promise.all([
    getHomepagePopularRoutes(),
    createClient(),
  ])

  const {
    data: { user },
  } = await supabase.auth.getUser()
  let role: 'admin' | 'user' | null = null
  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()
    role = profile?.role === 'admin' ? 'admin' : 'user'
  }

  const initialAuth = {
    isLoggedIn: !!user,
    role,
  }

  return (
    <LandingPageClient locale={locale} initialAuth={initialAuth}>
      {/* Above the fold - critical content */}
      <HeroSection />
      <SearchSection />
      <PopularRoutesSection locale={locale} routes={popularRoutes} />
      <AboutSection />
      <ParallaxSection />
      <TestimonialsSection />
      <FooterSection />
    </LandingPageClient>
  )
}
