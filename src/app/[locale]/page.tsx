"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Search,
  Play,
  MapPin,
  Calendar,
  Users,
  Shield,
  Globe,
  DollarSign,
  Instagram,
  Facebook,
  Youtube,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
} from "lucide-react"

export default function GeroxyMTravelPage() {
  const [activeSection, setActiveSection] = useState(1)
  const [scrollY, setScrollY] = useState(0)
  const [isVisible, setIsVisible] = useState<{ [key: string]: boolean }>({})
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [parallaxOffset, setParallaxOffset] = useState(0)

  useEffect(() => {
    let ticking = false
    let lastScrollY = 0
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const newScrollY = window.scrollY
          
          // Only update if scroll change is significant (reduces micro-movements)
          if (Math.abs(newScrollY - lastScrollY) > 0.5) {
            setScrollY(newScrollY)
            lastScrollY = newScrollY
          }

          // Update parallax offset for mobile
          if (parallaxRef.current) {
            const rect = parallaxRef.current.getBoundingClientRect()
            const elementTop = rect.top + newScrollY
            const elementHeight = rect.height
            const windowHeight = window.innerHeight
            
            // Calculate parallax only when element is in viewport
            if (rect.top < windowHeight && rect.bottom > 0) {
              const scrolled = newScrollY - elementTop + windowHeight
              const range = elementHeight + windowHeight
              const percentage = scrolled / range
              const offset = percentage * 200 // Parallax speed (increased for larger section)
              setParallaxOffset(offset)
            }
          }

          // Update active section based on scroll position
          const sections = [0, 800, 1600, 2400, 3200, 2800]
          const currentSection = sections.findIndex((pos, i) => {
            const nextPos = sections[i + 1] || Number.POSITIVE_INFINITY
            return newScrollY >= pos && newScrollY < nextPos
          })
          setActiveSection(currentSection + 1)

          const elements = document.querySelectorAll(".animate-on-scroll")
          elements.forEach((el) => {
            const rect = el.getBoundingClientRect()
            const isInView = rect.top < window.innerHeight * 0.8
            if (isInView) {
              el.classList.add("is-visible")
            }
          })
          
          ticking = false
        })
        ticking = true
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (index: number) => {
    const positions = [0, 800, 1600, 2400, 3200, 2800]
    window.scrollTo({ top: positions[index - 1], behavior: "smooth" })
  }

  return (
    <div className="min-h-screen bg-[#111111] text-white overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-black/50 border-b border-white/10 transition-all duration-300">
        <div className="max-w-[1440px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="text-2xl font-black text-white tracking-tight">
            Geroxym <span className="text-[#0EB582]">Travel</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              ACASĂ
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              DESPRE NOI
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              RUTE
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              GALERIE
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              RECENZII
            </a>
            <a
              href="#"
              className="text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide"
            >
              CONTACT
            </a>
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-white hover:text-[#0EB582] hover:bg-white/10 transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>

          <div className="hidden md:flex items-center gap-4">
            <select className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white font-semibold backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
              <option value="ro">RO</option>
              <option value="en">EN</option>
            </select>
            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:text-[#0EB582] hover:bg-white/10 transition-all"
            >
              <Search className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-xl border-b border-white/10">
            <nav className="px-6 py-4 space-y-4">
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                ACASĂ
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                DESPRE NOI
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                RUTE
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                GALERIE
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                RECENZII
              </a>
              <a
                href="#"
                className="block text-sm font-semibold text-white/90 hover:text-[#0EB582] transition-colors tracking-wide py-2"
              >
                CONTACT
              </a>
              <div className="flex items-center gap-4 pt-4 border-t border-white/10">
                <select className="bg-white/10 border border-white/20 rounded px-3 py-1.5 text-sm text-white font-semibold backdrop-blur-sm hover:bg-white/15 transition-colors cursor-pointer">
                  <option value="ro">RO</option>
                  <option value="en">EN</option>
                </select>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-white hover:text-[#0EB582] hover:bg-white/10 transition-all"
                >
                  <Search className="h-5 w-5" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </header>

      <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6">
        {[1, 2, 3, 4, 5, 6].map((num) => (
          <button
            key={num}
            onClick={() => scrollToSection(num)}
            className={`relative text-xl font-black transition-all duration-300 ${
              activeSection === num ? "text-white scale-125" : "text-white/30 hover:text-white/60"
            }`}
          >
            <span className={`${activeSection === num ? "text-[#0EB582]" : ""}`}>0{num}</span>
            {activeSection === num && (
              <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-[#0EB582]" />
            )}
          </button>
        ))}
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-12">
        <div className="absolute inset-0 parallax-container" style={{ transform: `translate3d(0, ${scrollY * 0.2}px, 0)`, willChange: 'transform', transition: 'transform 0.1s ease-out' }}>
          <img
            src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
            alt="Mountain landscape"
            className="w-full h-full object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#0d0d0d]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/60" />
          <div
            className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
            style={{
              backgroundImage:
                "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
            }}
          />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 text-center max-w-5xl px-6 animate-fade-in-up flex-1 flex flex-col items-center justify-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-black mb-6 text-balance text-shadow-lg tracking-tighter leading-none uppercase">
            Călătorește cu Geroxym
          </h1>
          <p className="text-base md:text-lg lg:text-xl mb-10 text-white/95 font-medium text-pretty text-shadow-md leading-relaxed max-w-3xl">
            Descoperă lumea într-un mod nou. Aventuri, confort și siguranță la fiecare pas.
          </p>
          <Button
            size="lg"
            className="bg-[#0EB582] hover:bg-[#0ca572] text-white px-10 py-6 text-base font-bold rounded-xl transition-all hover:scale-105 shadow-2xl hover:shadow-[#0EB582]/50 group"
          >
            Rezervă acum
            <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </div>

      </section>

      <section className="relative -mt-6 z-50 pb-16 md:pb-24">
        <div className="max-w-[1440px] mx-auto px-4 md:px-6">
          <Card className="bg-gradient-to-br from-white/98 to-white/95 backdrop-blur-2xl text-black p-4 md:p-10 rounded-2xl md:rounded-3xl shadow-[0_20px_80px_-15px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_100px_-15px_rgba(0,0,0,0.4)] transition-all duration-500 border border-white/40 overflow-hidden relative">
            {/* Decorative gradient orbs */}
            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#0EB582]/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#0EB582]/10 rounded-full blur-3xl" />
            
            <div className="relative z-10">
              {/* Header */}
              <div className="mb-6 md:mb-8 text-center md:text-left">
                <h2 className="text-xl md:text-3xl font-black text-gray-900 mb-2 flex items-center justify-center md:justify-start gap-2 md:gap-3">
                  <Search className="h-5 w-5 md:h-7 md:w-7 text-[#0EB582]" />
                  <span>Găsește-ți călătoria perfectă</span>
                </h2>
                <p className="text-sm md:text-base text-gray-600 font-medium">Rezervă rapid și simplu biletul tău de autocar</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
                {/* Departure */}
                <div className="lg:col-span-3">
                  <div className="relative group">
                    <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider md:absolute md:left-4 md:top-2 md:px-2 md:bg-white md:mb-0 md:text-xs">
                      Plecare
                    </label>
                    <div className="absolute left-4 top-[calc(50%+12px)] md:top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#0EB582]/10 flex items-center justify-center group-focus-within:bg-[#0EB582] group-hover:bg-[#0EB582]/20 transition-all">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#0EB582] group-focus-within:text-white transition-colors" />
                      </div>
                    </div>
                    <select className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md">
                      <option value="">Plecare din...</option>
                      <option>Drobeta-Turnu Severin</option>
                      <option>București</option>
                      <option>Timișoara</option>
                      <option>Cluj-Napoca</option>
                    </select>
                  </div>
                </div>

                {/* Destination */}
                <div className="lg:col-span-3">
                  <div className="relative group">
                    <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider md:absolute md:left-4 md:top-2 md:px-2 md:bg-white md:mb-0 md:text-xs">
                      Destinație
                    </label>
                    <div className="absolute left-4 top-[calc(50%+12px)] md:top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#0EB582]/10 flex items-center justify-center group-focus-within:bg-[#0EB582] group-hover:bg-[#0EB582]/20 transition-all">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-[#0EB582] group-focus-within:text-white transition-colors" />
                      </div>
                    </div>
                    <select className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md">
                      <option value="">Destinație...</option>
                      <option>București</option>
                      <option>Brașov</option>
                      <option>Sibiu</option>
                      <option>Constanța</option>
                    </select>
                  </div>
                </div>

                {/* Date */}
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider md:absolute md:left-4 md:top-2 md:px-2 md:bg-white md:mb-0 md:text-xs">
                      Data
                    </label>
                    <div className="absolute left-4 top-[calc(50%+12px)] md:top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#0EB582]/10 flex items-center justify-center group-focus-within:bg-[#0EB582] group-hover:bg-[#0EB582]/20 transition-all">
                        <Calendar className="h-4 w-4 md:h-5 md:w-5 text-[#0EB582] group-focus-within:text-white transition-colors" />
                      </div>
                    </div>
                    <input
                      type="date"
                      className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md"
                    />
                  </div>
                </div>

                {/* Passengers */}
                <div className="lg:col-span-2">
                  <div className="relative group">
                    <label className="block mb-2 text-xs font-bold text-gray-600 uppercase tracking-wider md:absolute md:left-4 md:top-2 md:px-2 md:bg-white md:mb-0 md:text-xs">
                      Persoane
                    </label>
                    <div className="absolute left-4 top-[calc(50%+12px)] md:top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                      <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl bg-[#0EB582]/10 flex items-center justify-center group-focus-within:bg-[#0EB582] group-hover:bg-[#0EB582]/20 transition-all">
                        <Users className="h-4 w-4 md:h-5 md:w-5 text-[#0EB582] group-focus-within:text-white transition-colors" />
                      </div>
                    </div>
                    <select className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md">
                      <option value="1">1 persoană</option>
                      <option value="2">2 persoane</option>
                      <option value="3">3 persoane</option>
                      <option value="4">4 persoane</option>
                      <option value="5">5 persoane</option>
                      <option value="6">6 persoane</option>
                      <option value="7">7 persoane</option>
                      <option value="8">8 persoane</option>
                      <option value="9">9 persoane</option>
                      <option value="10">10 persoane</option>
                    </select>
                  </div>
                </div>

                {/* Search Button */}
                <div className="lg:col-span-2 mt-4 lg:mt-0">
                  <Button className="w-full h-full min-h-[54px] md:min-h-[56px] bg-gradient-to-r from-[#0EB582] to-[#0ca572] hover:from-[#0ca572] hover:to-[#0a9563] text-white py-3.5 md:py-4 text-sm md:text-base font-bold rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#0EB582]/40 uppercase tracking-wide relative overflow-hidden group">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Search className="h-4 w-4 md:h-5 md:w-5" />
                      Caută rute
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  </Button>
                </div>
              </div>

              {/* Quick filters */}
              <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
                <span className="text-xs md:text-sm font-semibold text-gray-600">Rute populare:</span>
                {["București → Brașov", "Timișoara → Cluj", "Severin → Sibiu"].map((route, i) => (
                  <button
                    key={i}
                    className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 hover:bg-[#0EB582]/10 border border-gray-200 hover:border-[#0EB582]/30 rounded-full text-xs md:text-sm font-semibold text-gray-700 hover:text-[#0EB582] transition-all duration-300 hover:shadow-md"
                  >
                    {route}
                  </button>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      <div className="h-16 md:h-32 bg-gradient-to-b from-[#0d0d0d] to-[#0e1210]" />

      {/* Popular Routes Section */}
      <section className="relative py-12 md:py-24 px-4 md:px-6 animate-on-scroll opacity-0 transition-all duration-1000 bg-gradient-to-b from-[#0e1210] to-[#0f0f0f]">
        <div className="max-w-[1440px] mx-auto relative z-10">
          <div className="text-center mb-12 md:mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-white tracking-tighter uppercase">
              Rute Populare
            </h2>
            <p className="text-base md:text-lg text-white/90 font-medium tracking-wide">
              Alege destinația ta preferată
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                from: "București",
                to: "Brașov",
                price: "89 RON",
                image: "https://images.unsplash.com/photo-1590422749897-dcd4c5c7c1b5?q=80&w=2070&auto=format&fit=crop",
              },
              {
                from: "Timișoara",
                to: "Cluj",
                price: "95 RON",
                image: "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop",
              },
              {
                from: "Severin",
                to: "Sibiu",
                price: "120 RON",
                image: "https://images.unsplash.com/photo-1564221710304-0b37c8b9d729?q=80&w=2070&auto=format&fit=crop",
              },
              {
                from: "București",
                to: "Constanța",
                price: "75 RON",
                image: "https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=2070&auto=format&fit=crop",
              },
              {
                from: "Craiova",
                to: "București",
                price: "65 RON",
                image: "https://images.unsplash.com/photo-1605142859862-582d2f1a6a63?q=80&w=2070&auto=format&fit=crop",
              },
            ].map((route, i) => (
              <Card
                key={i}
                className="bg-white text-black overflow-hidden group cursor-pointer hover:shadow-2xl transition-all duration-500 hover:-translate-y-3 border-2 border-transparent hover:border-[#0EB582]/30 relative z-10"
              >
                <div className="relative h-56 overflow-hidden">
                  <img
                    src={route.image || "/placeholder.svg"}
                    alt={`${route.from} to ${route.to}`}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0EB582] to-[#0ca572] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-black text-white text-shadow-md tracking-tight">
                      {route.from} → {route.to}
                    </h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-black text-[#0EB582]">{route.price}</span>
                    <span className="text-xs text-gray-600 font-bold uppercase tracking-wide">per persoană</span>
                  </div>
                  <Button className="w-full bg-[#0EB582] hover:bg-[#0ca572] text-white font-bold transition-all hover:shadow-lg group-hover:scale-105 uppercase tracking-wide text-sm py-5 min-h-[48px]">
                    Vezi detalii
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-12 md:h-24 bg-gradient-to-b from-[#0f0f0f] to-[#0d0d0d]" />

      {/* Discover Section */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-gradient-to-b from-[#0f0e0d] to-[#0e0e0e] animate-on-scroll opacity-0 transition-all duration-1000">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-8 text-balance text-white leading-tight tracking-tighter uppercase">
                Descoperă lumea într-un mod nou
              </h2>
              <p className="text-base md:text-lg text-white/90 mb-10 text-pretty font-medium leading-relaxed">
                Vezi cum călătoria devine o experiență.
              </p>

              <div className="relative aspect-video rounded-2xl overflow-hidden group cursor-pointer mb-10 hover:shadow-2xl transition-all duration-500 border-2 border-white/10 hover:border-[#0EB582]/50">
                <img
                  src="https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop"
                  alt="Luxury bus interior"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/50 to-transparent group-hover:from-black/70 transition-all" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-20 h-20 rounded-full bg-[#0EB582] flex items-center justify-center group-hover:scale-125 transition-all duration-500 shadow-2xl shadow-[#0EB582]/50 ring-4 ring-white/20">
                    <Play className="h-8 w-8 text-white ml-1" fill="white" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6">
                  <p className="text-white font-bold text-base uppercase tracking-wide text-shadow-md">
                    Vizionează video
                  </p>
                </div>
              </div>

              <blockquote className="border-l-4 border-[#0EB582] pl-6 italic text-base text-white/95 leading-relaxed bg-white/5 p-6 rounded-r-xl">
                „Atașamentul față de confort este principalul obstacol în calea unei vieți interesante."
                <footer className="mt-4 text-sm text-white/80 font-bold not-italic">— Carlos Castaneda</footer>
              </blockquote>
            </div>

            <div className="space-y-6">
              {[
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
              ].map((feature, i) => (
                <Card
                  key={i}
                  className="bg-white/5 border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all duration-500 hover:shadow-xl hover:shadow-[#0EB582]/10 hover:translate-x-2 group relative z-10"
                >
                  <div className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-14 h-14 rounded-xl bg-[#0EB582]/20 flex items-center justify-center group-hover:bg-[#0EB582]/30 transition-colors group-hover:scale-110 duration-500">
                        <feature.icon className="h-7 w-7 text-[#0EB582]" />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-3 text-white tracking-tight">{feature.title}</h3>
                      <p className="text-sm text-white/90 leading-relaxed">{feature.desc}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="h-24 bg-gradient-to-b from-[#0e0e0e] to-[#0d0d0d]" />

      {/* Parallax Section */}
      <section ref={parallaxRef} className="relative h-[80vh] md:h-[70vh] overflow-hidden">
        {/* Mobile: Smooth transform-based parallax */}
        <div className="md:hidden absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?q=80&w=2070&auto=format&fit=crop"
            alt="Travel landscape"
            className="w-full h-[150%] object-cover"
            style={{ 
              transform: `translate3d(0, ${-parallaxOffset}px, 0)`,
              willChange: 'transform',
              objectPosition: 'center top'
            }}
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
            backgroundRepeat: 'no-repeat'
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-[#0d0d0d]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-black/60" />
        <div
          className="absolute inset-0 opacity-[0.03] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E\")",
          }}
        />
        <div className="relative z-10 h-full flex items-center justify-center">
          <div className="text-center px-6 max-w-4xl">
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter uppercase text-shadow-lg text-balance">
              Experiențe de neuitat
            </h3>
            <p className="text-lg md:text-xl text-white/95 font-medium text-shadow-md text-pretty leading-relaxed">
              Fiecare călătorie este o poveste nouă. Descoperă destinații uimitoare cu confort și siguranță.
            </p>
          </div>
        </div>
      </section>

      <div className="h-12 md:h-24 bg-gradient-to-b from-[#0c0d0f] to-[#0d0e10]" />

      {/* Testimonials Section */}
      <section className="py-12 md:py-24 px-4 md:px-6 bg-gradient-to-b from-[#0d0e10] to-[#0a0a0a] animate-on-scroll opacity-0 transition-all duration-1000">
        <div className="max-w-[1440px] mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black mb-6 text-white tracking-tighter uppercase">
              Ce spun clienții noștri
            </h2>
            <p className="text-base md:text-lg text-white/90 font-medium tracking-wide">
              Experiențe reale de la călători mulțumiți
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                name: "Maria Popescu",
                location: "București",
                review:
                  "O experiență minunată! Autocarele erau foarte curate și confortabile. Șoferul a fost foarte profesionist.",
                rating: 5,
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=200&auto=format&fit=crop",
              },
              {
                name: "Ion Georgescu",
                location: "Timișoara",
                review:
                  "Recomand cu încredere! Prețuri excelente și servicii de calitate. Am ajuns la timp la destinație.",
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
            ].map((testimonial, i) => (
              <Card
                key={i}
                className="bg-white/5 border-white/10 p-6 md:p-8 hover:bg-white/10 transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group relative z-10"
              >
                <div className="flex items-center gap-4 mb-6">
                  <img
                    src={testimonial.image || "/placeholder.svg"}
                    alt={testimonial.name}
                    className="w-16 h-16 rounded-full object-cover ring-2 ring-[#0EB582]/50 group-hover:ring-4 transition-all"
                  />
                  <div>
                    <h3 className="font-bold text-lg text-white tracking-tight">{testimonial.name}</h3>
                    <p className="text-white/80 text-sm font-medium">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-[#0EB582] text-xl">
                      ★
                    </span>
                  ))}
                </div>
                <p className="text-white/95 italic leading-relaxed">"{testimonial.review}"</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <div className="h-20 bg-gradient-to-b from-[#0a0a0a] to-[#080808]" />

      {/* Footer */}
      <footer className="bg-[#080808] border-t border-white/10 py-16 px-6">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
            <div>
              <h3 className="text-2xl font-black text-white mb-3 tracking-tight">
                Geroxym <span className="text-[#0EB582]">Travel</span>
              </h3>
              <p className="text-white/80 text-sm leading-relaxed">
                Companie de transport și turism din Drobeta-Turnu Severin. Oferim servicii de transport persoane pe rute
                naționale și internaționale.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg uppercase tracking-wide">Link-uri Rapide</h4>
              <ul className="space-y-3 text-sm text-white/80">
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0EB582] transition-colors font-semibold hover:translate-x-1 inline-block"
                  >
                    Acasă
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0EB582] transition-colors font-semibold hover:translate-x-1 inline-block"
                  >
                    Rute
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0EB582] transition-colors font-semibold hover:translate-x-1 inline-block"
                  >
                    Contact
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="hover:text-[#0EB582] transition-colors font-semibold hover:translate-x-1 inline-block"
                  >
                    Termeni & Condiții
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-6 text-white text-lg uppercase tracking-wide">Urmărește-ne</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0EB582] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0EB582]/50"
                >
                  <Instagram className="h-5 w-5" />
                </a>
                <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0EB582] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0EB582]/50"
                >
                  <Facebook className="h-5 w-5" />
        </a>
        <a
                  href="#"
                  className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center hover:bg-[#0EB582] transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-[#0EB582]/50"
                >
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-sm text-white/60">
            <p className="font-semibold tracking-wide">© 2025 Geroxym Travel. Toate drepturile rezervate.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}