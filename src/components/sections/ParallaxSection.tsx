'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

export default function ParallaxSection() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  useEffect(() => {
    let ticking = false
    let lastScrollY = 0

    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const newScrollY = window.scrollY

          if (Math.abs(newScrollY - lastScrollY) > 0.5) {
            lastScrollY = newScrollY

            if (parallaxRef.current) {
              const rect = parallaxRef.current.getBoundingClientRect()
              const elementTop = rect.top + newScrollY
              const elementHeight = rect.height
              const windowHeight = window.innerHeight

              if (rect.top < windowHeight && rect.bottom > 0) {
                const scrolled = newScrollY - elementTop + windowHeight
                const range = elementHeight + windowHeight
                const percentage = scrolled / range
                const offset = percentage * 200
                setParallaxOffset(offset)
              }
            }
          }

          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <section id="parallax" ref={parallaxRef} className="relative h-[80vh] md:h-[70vh] overflow-hidden">
      {/* Mobile: Smooth transform-based parallax */}
      <div className="md:hidden absolute inset-0">
        <Image
          src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2070&auto=format&fit=crop"
          alt="Travel landscape"
          fill
          className="object-cover"
          style={{
            transform: `translate3d(0, ${-parallaxOffset}px, 0)`,
            willChange: 'transform',
            objectPosition: 'center top',
          }}
          sizes="100vw"
          quality={85}
          loading="lazy"
        />
      </div>
      {/* Desktop: Fixed background attachment */}
      <div
        className="hidden md:block absolute inset-0"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2070&auto=format&fit=crop)',
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
        }}
      />
      <div className="absolute inset-0 bg-foreground/50" />
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="text-center px-6 max-w-4xl">
          <h3 className="text-impact-dark text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-primary-foreground mb-6 text-balance leading-snug">
            Experiențe de neuitat
          </h3>
          <p className="text-lg md:text-xl text-primary-foreground/90 font-medium text-pretty leading-relaxed">
            Fiecare călătorie este o poveste nouă. Descoperă destinații uimitoare cu confort și siguranță.
          </p>
        </div>
      </div>
    </section>
  )
}

