import { Loader2 } from 'lucide-react'

export default function AccountLoading() {
  return (
    <div className="container mx-auto flex max-w-6xl items-center justify-center px-4 py-24">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Se încarcă contul...</span>
    </div>
  )
}
