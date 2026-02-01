import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { ArrowRight, ArrowDown, MapPin, Calendar, Users } from 'lucide-react'

export default function HeroSection() {
  return (
    <section id="home" className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
      <div className="absolute inset-0 parallax-container">
        <Image
          src="/images/img_dest.avif"
          alt="Mountain landscape"
          fill
          priority
          className="object-cover scale-110"
          sizes="100vw"
          quality={85}
        />
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* Hero – Marcelo Design X: display font, cinematic spacing, accent line */}
      <div className="relative z-10 text-center max-w-5xl px-6 animate-fade-in-up flex-1 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-3 mb-5">
          <div className="accent-line" aria-hidden />
          <p className="font-display text-white/95 text-xs lg:text-xl uppercase tracking-cinematic font-semibold drop-shadow-md">
            Descoperă Lumea cu Noi
          </p>
        </div>
        <h1 className="text-impact-hero uppercase text-4xl sm:text-4xl md:text-5xl lg:text-7xl text-white mb-5 text-balance">
          CĂLĂTOREȘTE CU GEROXYM
          <br />
          
        </h1>
        <p className="text-display sm:text-lg text-white/95 max-w-1xl mx-auto mb-8 leading-relaxed text-pretty drop-shadow-sm font-sans">
          Transport modern, rute atent selectate și rezervări rapide.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="font-display font-semibold px-6 tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 border-0 shadow-md hover:shadow-lg transition-shadow" asChild>
            <a href="/ro/routes">
              Explorează Rute
              <ArrowRight className="ml-2 h-5 w-5" />
            </a>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="font-display font-semibold px-6 tracking-wide bg-white/10 border border-white/50 text-white hover:bg-white hover:text-foreground transition-all"
            asChild
          >
            <a href="/ro/routes">Rezervă Acum</a>
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-3xl mx-auto pt-2">
          <div className="flex items-center justify-center gap-3 text-white/90 text-sm font-medium tracking-wide">
            <MapPin className="h-5 w-5 shrink-0" />
            <span>Rute naționale & internaționale</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/90 text-sm font-medium tracking-wide">
            <Calendar className="h-5 w-5 shrink-0" />
            <span>Rezervare rapidă</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-white/90 text-sm font-medium tracking-wide">
            <Users className="h-5 w-5 shrink-0" />
            <span>Transport confortabil</span>
          </div>
        </div>
      </div>

      <a
        href="#search"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white animate-bounce z-10 drop-shadow-md"
        aria-label="Scroll to search"
      >
        <ArrowDown className="h-6 w-6" />
      </a>
    </section>
  )
}

