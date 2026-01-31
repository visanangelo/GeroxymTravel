'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MapPin, Calendar, Users, Search } from 'lucide-react'

export function RouteSearchForm() {
  const router = useRouter()
  const [origin, setOrigin] = useState('')
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [passengers, setPassengers] = useState('1')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (origin) params.set('origin', origin)
    if (destination) params.set('destination', destination)
    if (date) params.set('date', date)
    router.push(`/ro/routes?${params.toString()}`)
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-6">
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
            <select
              value={origin}
              onChange={(e) => setOrigin(e.target.value)}
              className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
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
            <select
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
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
              value={date}
              onChange={(e) => setDate(e.target.value)}
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
            <select
              value={passengers}
              onChange={(e) => setPassengers(e.target.value)}
              className="w-full pl-14 md:pl-16 pr-4 py-3.5 md:py-4 border-2 border-gray-200 rounded-xl md:rounded-2xl focus:ring-2 focus:ring-[#0EB582]/50 focus:border-[#0EB582] font-semibold hover:border-[#0EB582]/50 transition-all duration-300 text-sm md:text-base bg-white/80 backdrop-blur-sm appearance-none cursor-pointer shadow-sm hover:shadow-md"
            >
              {Array.from({ length: 10 }, (_, i) => i + 1).map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? 'persoană' : 'persoane'}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search Button */}
        <div className="lg:col-span-2 mt-4 lg:mt-0">
          <Button
            type="submit"
            className="w-full h-full min-h-[54px] md:min-h-[56px] bg-gradient-to-r from-[#0EB582] to-[#0ca572] hover:from-[#0ca572] hover:to-[#0a9563] text-white py-3.5 md:py-4 text-sm md:text-base font-bold rounded-xl md:rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-[#0EB582]/40 uppercase tracking-wide relative overflow-hidden group"
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              <Search className="h-4 w-4 md:h-5 md:w-5" />
              Caută rute
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
          </Button>
        </div>
      </form>

      {/* Quick filters */}
      <div className="mt-4 md:mt-6 pt-4 md:pt-6 border-t border-gray-200/60 flex flex-wrap items-center justify-center md:justify-start gap-2 md:gap-3">
        <span className="text-xs md:text-sm font-semibold text-gray-600">Rute populare:</span>
        {["București → Brașov", "Timișoara → Cluj", "Severin → Sibiu"].map((route, i) => (
          <button
            key={i}
            onClick={() => {
              const [from, to] = route.split(' → ')
              router.push(`/ro/routes?origin=${encodeURIComponent(from)}&destination=${encodeURIComponent(to)}`)
            }}
            className="px-3 py-1.5 md:px-4 md:py-2 bg-gray-50 hover:bg-[#0EB582]/10 border border-gray-200 hover:border-[#0EB582]/30 rounded-full text-xs md:text-sm font-semibold text-gray-700 hover:text-[#0EB582] transition-all duration-300 hover:shadow-md"
          >
            {route}
          </button>
        ))}
      </div>
    </>
  )
}

