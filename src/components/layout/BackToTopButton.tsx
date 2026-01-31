'use client'

import { ArrowUp } from 'lucide-react'

type Props = {
  show: boolean
  onClick: () => void
}

export default function BackToTopButton({ show, onClick }: Props) {
  if (!show) return null

  return (
    <button
      onClick={onClick}
      className="fixed bottom-8 right-8 z-50 w-14 h-14 bg-gradient-to-r from-[#0EB582] to-[#0ca572] hover:from-[#0ca572] hover:to-[#0a9563] text-white rounded-full flex items-center justify-center shadow-2xl hover:shadow-[#0EB582]/50 transition-all duration-300 hover:scale-110 group"
      aria-label="Înapoi sus"
    >
      <ArrowUp className="h-6 w-6 group-hover:-translate-y-1 transition-transform" />
    </button>
  )
}

