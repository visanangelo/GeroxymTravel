'use client'

type Props = {
  activeSection: number
  onSectionClick: (index: number) => void
}

export default function ScrollNavigation({ activeSection, onSectionClick }: Props) {
  const sections = [
    { num: 1, label: 'Acasă' },
    { num: 2, label: 'Căutare' },
    { num: 3, label: 'Galerie' },
    { num: 4, label: 'Despre' },
    { num: 5, label: 'Parallax' },
    { num: 6, label: 'Recenzii' },
  ]

  return (
    <div className="fixed right-8 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-6">
      {sections.map(({ num, label }) => (
        <button
          key={num}
          onClick={() => onSectionClick(num)}
          className={`relative text-xl font-black transition-all duration-300 group ${
            activeSection === num ? "text-white scale-125" : "text-white/30 hover:text-white/60"
          }`}
          aria-label={label}
          title={label}
        >
          <span className={`${activeSection === num ? "text-[#0EB582]" : ""}`}>0{num}</span>
          {activeSection === num && (
            <div className="absolute -left-8 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-[#0EB582] transition-all" />
          )}
        </button>
      ))}
    </div>
  )
}

