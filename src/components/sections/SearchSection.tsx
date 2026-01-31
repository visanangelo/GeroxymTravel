import { Card } from '@/components/ui/card'
import { Search } from 'lucide-react'
import { RouteSearchForm } from './RouteSearchForm'

export default function SearchSection() {
  return (
    <section id="search" className="relative -mt-6 z-50 pb-16 md:pb-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card className="bg-card backdrop-blur-md p-6 md:p-10 rounded-2xl border border-border shadow-lg overflow-hidden relative">
          <div className="relative z-10">
            <div className="mb-6 md:mb-8 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-3 mb-2">
                <Search className="h-6 w-6 text-primary shrink-0 order-first md:order-none" />
                <h2 className="font-display text-xl md:text-2xl font-bold text-foreground tracking-tight">
                  Găsește-ți călătoria perfectă
                </h2>
              </div>
              <p className="text-sm md:text-base text-muted-foreground">Rezervă rapid și simplu biletul tău de autocar.</p>
            </div>
            <RouteSearchForm />
          </div>
        </Card>
      </div>
    </section>
  )
}

