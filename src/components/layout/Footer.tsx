import Link from 'next/link'
import { useTranslations, useLocale } from 'next-intl'
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  const t = useTranslations('footer')
  const locale = useLocale()

  return (
    <footer className="bg-muted/50 border-t">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-xl font-montserrat">{t('company')}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              {t('description')}
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-5 w-5 text-muted-foreground hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Link-uri Rapide</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href={`/${locale}/destinations`} className="text-muted-foreground hover:text-primary transition-colors">
                  Destinații
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/tours`} className="text-muted-foreground hover:text-primary transition-colors">
                  Ture Organizate
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/about`} className="text-muted-foreground hover:text-primary transition-colors">
                  Despre Noi
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/contact`} className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Servicii</h3>
            <ul className="space-y-2 text-sm">
              <li className="text-muted-foreground">Ture în țară</li>
              <li className="text-muted-foreground">Ture internaționale</li>
              <li className="text-muted-foreground">Excursii de o zi</li>
              <li className="text-muted-foreground">Transport organizat</li>
              <li className="text-muted-foreground">Ghid local</li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Contact</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Phone className="h-4 w-4" />
                <span>+40 123 456 789</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>info@geroxymtravel.ro</span>
              </div>
              <div className="flex items-center space-x-2 text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>București, România</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
          <p>&copy; 2025 {t('company')}. {t('rights')}.</p>
        </div>
      </div>
    </footer>
  )
}

