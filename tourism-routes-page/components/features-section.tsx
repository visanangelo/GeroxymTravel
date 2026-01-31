import { Shield, Heart, Sparkles, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Siguranță Garantată",
    description:
      "Călătorești în siguranță cu asigurare completă și suport 24/7 pe tot parcursul circuitului.",
  },
  {
    icon: Heart,
    title: "Experiențe Autentice",
    description:
      "Descoperă locuri ascunse și tradiții locale alături de ghizi cu experiență.",
  },
  {
    icon: Sparkles,
    title: "Servicii Premium",
    description:
      "Hoteluri selectate cu grijă, transport confortabil și mese incluse în fiecare circuit.",
  },
  {
    icon: Headphones,
    title: "Suport Dedicat",
    description:
      "Echipa noastră este mereu disponibilă pentru orice nevoie, înainte și în timpul călătoriei.",
  },
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-3 font-medium">
            De Ce Noi
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold text-foreground mb-4 text-balance">
            Călătorește cu Încredere
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Cu peste 15 ani de experiență, suntem dedicați să oferim cele mai
            bune experiențe de călătorie.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="text-center p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
            >
              <div className="w-14 h-14 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <feature.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
