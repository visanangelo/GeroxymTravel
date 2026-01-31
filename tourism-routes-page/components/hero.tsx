import { ArrowDown, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div className="absolute inset-0 bg-[url('/images/santorini.jpg')] bg-cover bg-center" />
      <div className="absolute inset-0 bg-foreground/40" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-primary-foreground/80 text-sm uppercase tracking-[0.3em] mb-4 font-medium">
          Descoperă Lumea cu Noi
        </p>
        <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-primary-foreground mb-6 leading-tight text-balance">
          Circuite Turistice
          <br />
          <span className="italic font-normal">de Neuitat</span>
        </h1>
        <p className="text-lg sm:text-xl text-primary-foreground/90 max-w-2xl mx-auto mb-10 leading-relaxed text-pretty">
          Experiențe autentice în cele mai spectaculoase destinații din lume.
          Călătorește cu experți locali și creează amintiri pentru o viață.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button size="lg" className="px-8">
            Explorează Circuite
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="px-8 bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-foreground"
          >
            Planifică Aventura
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
          <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
            <MapPin className="h-5 w-5" />
            <span className="text-sm font-medium">50+ Destinații</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
            <Calendar className="h-5 w-5" />
            <span className="text-sm font-medium">Circuite 7-21 Zile</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-primary-foreground/90">
            <Users className="h-5 w-5" />
            <span className="text-sm font-medium">Grupuri Mici</span>
          </div>
        </div>
      </div>

      <a
        href="#circuite"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary-foreground animate-bounce"
        aria-label="Scroll to circuits"
      >
        <ArrowDown className="h-6 w-6" />
      </a>
    </section>
  );
}
