"use client";

import Image from "next/image";
import { Calendar, MapPin, Star, Users, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CircuitCardProps {
  title: string;
  location: string;
  duration: string;
  groupSize: string;
  rating: number;
  reviews: number;
  price: number;
  originalPrice?: number;
  image: string;
  highlights: string[];
  featured?: boolean;
}

export function CircuitCard({
  title,
  location,
  duration,
  groupSize,
  rating,
  reviews,
  price,
  originalPrice,
  image,
  highlights,
  featured,
}: CircuitCardProps) {
  return (
    <article className="group bg-card rounded-xl overflow-hidden border border-border hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="relative h-64 overflow-hidden">
        <Image
          src={image || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {featured && (
          <Badge className="absolute top-4 left-4 bg-accent text-accent-foreground">
            Popular
          </Badge>
        )}
        {originalPrice && (
          <Badge
            variant="secondary"
            className="absolute top-4 right-4 bg-destructive text-primary-foreground"
          >
            -{Math.round(((originalPrice - price) / originalPrice) * 100)}%
          </Badge>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-2">
          <MapPin className="h-4 w-4" />
          <span>{location}</span>
        </div>

        <h3 className="text-xl font-semibold text-foreground mb-3 group-hover:text-primary transition-colors">
          {title}
        </h3>

        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Users className="h-4 w-4" />
            <span>{groupSize}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Star className="h-4 w-4 fill-chart-4 text-chart-4" />
            <span>
              {rating} ({reviews})
            </span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {highlights.slice(0, 3).map((highlight) => (
            <span
              key={highlight}
              className="text-xs bg-secondary text-secondary-foreground px-2.5 py-1 rounded-full"
            >
              {highlight}
            </span>
          ))}
        </div>

        <div className="flex items-end justify-between pt-4 border-t border-border">
          <div>
            <p className="text-xs text-muted-foreground mb-1">
              Pornind de la
            </p>
            <div className="flex items-baseline gap-2">
              {originalPrice && (
                <span className="text-sm text-muted-foreground line-through">
                  €{originalPrice}
                </span>
              )}
              <span className="text-2xl font-bold text-primary">€{price}</span>
              <span className="text-sm text-muted-foreground">/pers</span>
            </div>
          </div>
          <Button size="sm" className="group/btn">
            Detalii
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
          </Button>
        </div>
      </div>
    </article>
  );
}
