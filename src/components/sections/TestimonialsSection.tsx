import Image from 'next/image'
import { Card } from '@/components/ui/card'

const testimonials = [
  {
    name: "Maria Popescu",
    location: "București",
    review: "O experiență minunată! Autocarele erau foarte curate și confortabile. Șoferul a fost foarte profesionist.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Ion Georgescu",
    location: "Timișoara",
    review: "Recomand cu încredere! Prețuri excelente și servicii de calitate. Am ajuns la timp la destinație.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=200&auto=format&fit=crop",
  },
  {
    name: "Elena Dumitrescu",
    location: "Cluj-Napoca",
    review: "Călătoresc frecvent cu Geroxym Travel. Întotdeauna o experiență plăcută și sigură.",
    rating: 5,
    image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&auto=format&fit=crop",
  },
]

export default function TestimonialsSection() {
  return (
    <section id="recenzii" className="py-24 px-4 md:px-6 bg-secondary animate-on-scroll opacity-0 transition-all duration-1000">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <div className="flex flex-col items-center gap-3 mb-4">
            <div className="accent-line" aria-hidden />
            <p className="font-display text-primary text-xs uppercase tracking-cinematic font-semibold">
              Recenzii
            </p>
          </div>
          <h2 className="text-impact font-display text-2xl sm:text-3xl md:text-4xl text-foreground mb-4 text-balance leading-tight">
            Ce spun clienții noștri
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Experiențe reale de la călători mulțumiți.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, i) => (
            <Card
              key={i}
              className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-4 mb-4">
                <Image
                  src={testimonial.image}
                  alt={testimonial.name}
                  width={56}
                  height={56}
                  className="rounded-full object-cover ring-2 ring-primary/30"
                />
                <div>
                  <h3 className="font-semibold text-foreground">{testimonial.name}</h3>
                  <p className="text-muted-foreground text-sm">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex gap-1 mb-3">
                {[...Array(testimonial.rating)].map((_, j) => (
                  <span key={j} className="text-primary text-lg">★</span>
                ))}
              </div>
              <p className="text-muted-foreground italic text-sm leading-relaxed">"{testimonial.review}"</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

