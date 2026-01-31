import Image from 'next/image'
import { Shield, Users, Calendar, Play } from 'lucide-react'

const features = [
  {
    title: "Confort Premium",
    desc: "Autocare moderne echipate cu aer condiționat, scaune ergonomice și WiFi gratuit.",
    icon: Shield,
  },
  {
    title: "Șoferi Profesioniști",
    desc: "Echipa noastră de șoferi experimentați asigură o călătorie sigură și plăcută.",
    icon: Users,
  },
  {
    title: "Flexibilitate Totală",
    desc: "Modifică sau anulează rezervarea cu până la 24h înainte de plecare.",
    icon: Calendar,
  },
]

export default function AboutSection() {
  return (
    <section id="despre" className="py-24 px-4 md:px-6 bg-secondary animate-on-scroll opacity-0 transition-all duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="accent-line" aria-hidden />
            <p className="font-display text-primary text-xs uppercase tracking-cinematic font-semibold">
              De Ce Noi
            </p>
          </div>
          <h2 className="text-impact font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 text-balance leading-tight">
            Călătorește cu Încredere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Confort premium, șoferi profesioniști și flexibilitate. Vezi cum călătoria devine o experiență.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, i) => (
            <div
              key={i}
              className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-display text-base font-semibold text-foreground mb-2 tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.desc}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-16 max-w-3xl mx-auto">
          <div className="relative aspect-video rounded-xl overflow-hidden border border-border">
            <Image
              src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
              alt="Autocar interior"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              quality={85}
              loading="lazy"
            />
            <div className="absolute inset-0 bg-foreground/30 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
                <Play className="h-7 w-7 text-primary-foreground ml-1" fill="currentColor" />
              </div>
            </div>
          </div>
          <blockquote className="mt-6 border-l-4 border-primary pl-6 italic text-muted-foreground bg-card p-4 rounded-r-xl border border-border">
            „Atașamentul față de confort este principalul obstacol în calea unei vieți interesante."
            <footer className="mt-2 text-sm font-medium text-foreground not-italic">— Carlos Castaneda</footer>
          </blockquote>
        </div>
      </div>
    </section>
  )
}

