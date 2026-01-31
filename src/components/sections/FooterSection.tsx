'use client'

import Link from 'next/link'
import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Youtube, Compass } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function FooterSection() {
  // Handle navigation internally - no need for props from server component
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, target: string) => {
    e.preventDefault()
    if (target === 'home') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    } else {
      const element = document.getElementById(target)
      if (element) {
        const headerOffset = 80
        const elementPosition = element.getBoundingClientRect().top
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset
        window.scrollTo({ top: offsetPosition, behavior: 'smooth' })
      }
    }
  }

  return (
    <footer id="contact" className="bg-foreground text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 mb-12">
          <div>
            <h3 className="font-display text-lg font-semibold mb-4 tracking-tight flex items-center gap-2">
              <Compass className="h-8 w-8 shrink-0" />
              Geroxym Travel
            </h3>
            <p className="text-primary-foreground/70 text-sm leading-relaxed">
              Companie de transport și turism din Drobeta-Turnu Severin. Oferim servicii de transport persoane pe rute
              naționale și internaționale.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Link-uri Rapide</h4>
            <ul className="space-y-2 text-sm text-primary-foreground/70">
              <li><a href="#home" onClick={(e) => handleNavClick(e, 'home')} className="hover:text-primary-foreground transition-colors">Acasă</a></li>
              <li><a href="#despre" onClick={(e) => handleNavClick(e, 'despre')} className="hover:text-primary-foreground transition-colors">Despre Noi</a></li>
              <li><a href="#galerie" onClick={(e) => handleNavClick(e, 'galerie')} className="hover:text-primary-foreground transition-colors">Galerie</a></li>
              <li><a href="#recenzii" onClick={(e) => handleNavClick(e, 'recenzii')} className="hover:text-primary-foreground transition-colors">Recenzii</a></li>
              <li><a href="#contact" onClick={(e) => handleNavClick(e, 'contact')} className="hover:text-primary-foreground transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <div className="space-y-4 text-sm text-primary-foreground/70">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground/60 text-xs">Telefon</p>
                  <a href="tel:+40123456789" className="font-medium text-primary-foreground hover:underline">+40 123 456 789</a>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground/60 text-xs">Email</p>
                  <a href="mailto:info@geroxymtravel.ro" className="font-medium text-primary-foreground hover:underline">info@geroxymtravel.ro</a>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <MapPin className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="text-primary-foreground/60 text-xs">Adresă</p>
                  <p className="font-medium text-primary-foreground">Drobeta-Turnu Severin, România</p>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h5 className="font-semibold mb-4 text-sm">Urmărește-ne</h5>
              <div className="flex gap-4">
                <a href="https://instagram.com/geroxymtravel" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Instagram"><Instagram className="h-5 w-5" /></a>
                <a href="https://facebook.com/geroxymtravel" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="Facebook"><Facebook className="h-5 w-5" /></a>
                <a href="https://youtube.com/@geroxymtravel" target="_blank" rel="noopener noreferrer" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors" aria-label="YouTube"><Youtube className="h-5 w-5" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-primary-foreground/20 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-primary-foreground/60">© 2025 Geroxym Travel. Toate drepturile rezervate.</p>
        </div>
      </div>
    </footer>
  )
}
