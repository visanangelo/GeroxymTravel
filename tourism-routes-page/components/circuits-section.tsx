"use client";

import { useState } from "react";
import { CircuitCard } from "./circuit-card";
import { Button } from "@/components/ui/button";

const circuits = [
  {
    id: 1,
    title: "Grecia Clasică & Santorini",
    location: "Grecia",
    duration: "10 zile",
    groupSize: "Max 16 pers",
    rating: 4.9,
    reviews: 234,
    price: 1890,
    originalPrice: 2190,
    image: "/images/santorini.jpg",
    highlights: ["Atena", "Santorini", "Mykonos", "Delphi"],
    featured: true,
    category: "Europa",
  },
  {
    id: 2,
    title: "Bali & Templele Sacre",
    location: "Indonezia",
    duration: "12 zile",
    groupSize: "Max 12 pers",
    rating: 4.8,
    reviews: 189,
    price: 2290,
    image: "/images/bali.jpg",
    highlights: ["Ubud", "Terase Orez", "Temple", "Plaje"],
    featured: true,
    category: "Asia",
  },
  {
    id: 3,
    title: "Misterele Machu Picchu",
    location: "Peru",
    duration: "14 zile",
    groupSize: "Max 14 pers",
    rating: 4.9,
    reviews: 156,
    price: 3490,
    originalPrice: 3890,
    image: "/images/machu-picchu.jpg",
    highlights: ["Lima", "Cusco", "Valea Sacră", "Machu Picchu"],
    featured: false,
    category: "America de Sud",
  },
  {
    id: 4,
    title: "Islanda - Țara Focului și Gheții",
    location: "Islanda",
    duration: "8 zile",
    groupSize: "Max 10 pers",
    rating: 5.0,
    reviews: 98,
    price: 2890,
    image: "/images/iceland.jpg",
    highlights: ["Aurora Boreală", "Geyser", "Cascade", "Ghețari"],
    featured: true,
    category: "Europa",
  },
  {
    id: 5,
    title: "Japonia Tradițională",
    location: "Japonia",
    duration: "15 zile",
    groupSize: "Max 12 pers",
    rating: 4.9,
    reviews: 211,
    price: 4290,
    image: "/images/japan.jpg",
    highlights: ["Tokyo", "Kyoto", "Mount Fuji", "Osaka"],
    featured: false,
    category: "Asia",
  },
  {
    id: 6,
    title: "Maroc Imperial",
    location: "Maroc",
    duration: "9 zile",
    groupSize: "Max 16 pers",
    rating: 4.7,
    reviews: 167,
    price: 1590,
    originalPrice: 1790,
    image: "/images/morocco.jpg",
    highlights: ["Marrakech", "Fes", "Deșert", "Chefchaouen"],
    featured: false,
    category: "Africa",
  },
];

const categories = ["Toate", "Europa", "Asia", "America de Sud", "Africa"];

export function CircuitsSection() {
  const [activeCategory, setActiveCategory] = useState("Toate");

  const filteredCircuits =
    activeCategory === "Toate"
      ? circuits
      : circuits.filter((c) => c.category === activeCategory);

  return (
    <section id="circuite" className="py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-primary text-sm uppercase tracking-[0.2em] mb-3 font-medium">
            Explorează
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
            Circuitele Noastre
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Fiecare circuit este creat cu grijă pentru a oferi experiențe
            autentice și momente de neuitat.
          </p>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category}
              variant={activeCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCircuits.map((circuit) => (
            <CircuitCard key={circuit.id} {...circuit} />
          ))}
        </div>

        <div className="text-center mt-12">
          <Button variant="outline" size="lg" className="px-8 bg-transparent">
            Vezi Toate Circuitele
          </Button>
        </div>
      </div>
    </section>
  );
}
