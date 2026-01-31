'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import ScrollNavigation from './ScrollNavigation'
import BackToTopButton from './BackToTopButton'
import LandingHeader from './LandingHeader'

export type InitialAuth = {
  isLoggedIn: boolean
  role: 'admin' | 'user' | null
}

type Props = {
  children: React.ReactNode
  locale?: string
  initialAuth?: InitialAuth
}

// Memoize section IDs to avoid recreating array on each render
const SECTION_IDS = ['home', 'search', 'galerie', 'despre', 'parallax', 'recenzii'] as const

export default function LandingPageClient({ children, locale = 'ro', initialAuth }: Props) {
  const [activeSection, setActiveSection] = useState(1)
  const [showBackToTop, setShowBackToTop] = useState(false)
  const observerRef = useRef<IntersectionObserver | null>(null)
  const sectionRefs = useRef<Map<string, number>>(new Map())

  const scrollToSection = useCallback((index: number) => {
    const targetId = SECTION_IDS[index - 1]
    if (targetId) {
      const element = document.getElementById(targetId)
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }
  }, [])

  const scrollToTop = useCallback(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [])

  const handleNavClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    if (target === 'home') {
      scrollToTop()
    } else {
      const element = document.getElementById(target)
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }
  }, [scrollToTop])

  // Use Intersection Observer for scroll detection (more performant than scroll events)
  useEffect(() => {
    // Set up Intersection Observer for section visibility (navigation)
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px', // Trigger when section is 20% from top
      threshold: 0,
    }

    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const sectionId = entry.target.id
          const index = SECTION_IDS.indexOf(sectionId as typeof SECTION_IDS[number])
          if (index !== -1) {
            setActiveSection(index + 1)
          }
        }
      })
    }, observerOptions)

    // Observe all sections for navigation
    SECTION_IDS.forEach((id) => {
      const element = document.getElementById(id)
      if (element) {
        observerRef.current?.observe(element)
      }
    })

    // Set up separate Intersection Observer for animate-on-scroll elements
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
            // Unobserve after animation to improve performance
            animationObserver.unobserve(entry.target)
          }
        })
      },
      {
        root: null,
        rootMargin: '-10% 0px -10% 0px', // Trigger when element is 10% into viewport
        threshold: 0.1,
      }
    )

    // Observe all elements with animate-on-scroll class
    const animateElements = document.querySelectorAll('.animate-on-scroll')
    animateElements.forEach((el) => {
      animationObserver.observe(el)
    })

    // Fallback scroll handler for back-to-top button (lightweight)
    let lastScrollY = 0
    let rafId: number | null = null

    const handleScroll = () => {
      rafId = requestAnimationFrame(() => {
        const newScrollY = window.scrollY
        // Only update if scroll change is significant
        if (Math.abs(newScrollY - lastScrollY) > 50) {
          setShowBackToTop(newScrollY > 500)
          lastScrollY = newScrollY
        }
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observerRef.current?.disconnect()
      animationObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (rafId !== null) {
        cancelAnimationFrame(rafId)
      }
    }
  }, [])

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <LandingHeader
        locale={locale}
        initialAuth={initialAuth}
        onNavClick={handleNavClick}
        onScrollToTop={scrollToTop}
      />
      {children}
      <ScrollNavigation activeSection={activeSection} onSectionClick={scrollToSection} />
      <BackToTopButton show={showBackToTop} onClick={scrollToTop} />
    </div>
  )
}
