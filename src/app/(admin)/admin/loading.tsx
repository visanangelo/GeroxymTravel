import { Loader2 } from 'lucide-react'

export default function AdminLoading() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center p-8">
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden />
      <span className="sr-only">Se încarcă panoul admin...</span>
    </div>
  )
}
