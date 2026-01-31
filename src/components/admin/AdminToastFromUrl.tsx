'use client'

import { useEffect, useRef } from 'react'
import { usePathname, useSearchParams, useRouter } from 'next/navigation'
import { toast } from 'sonner'

const TOAST_PARAM = 'toast'

const MESSAGES: Record<string, { message: string; type: 'success' | 'error' }> = {
  created: { message: 'Rută creată cu succes', type: 'success' },
  updated: { message: 'Rută actualizată cu succes', type: 'success' },
  cancelled: { message: 'Rută anulată', type: 'success' },
  deleted: { message: 'Rută ștearsă', type: 'success' },
  order_created: { message: 'Comandă offline creată', type: 'success' },
  ticket_cancelled: { message: 'Bilet anulat', type: 'success' },
  seat_changed: { message: 'Loc schimbat', type: 'success' },
  error: { message: 'Ceva nu a mers bine', type: 'error' },
}

export function AdminToastFromUrl() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()
  const lastShownRef = useRef<string | null>(null)

  useEffect(() => {
    const value = searchParams.get(TOAST_PARAM)
    if (!value) {
      lastShownRef.current = null
      return
    }

    const key = `${pathname}-${value}`
    if (lastShownRef.current === key) return
    lastShownRef.current = key

    const config = MESSAGES[value]
    if (config) {
      const id = `admin-url-toast-${key}`
      if (config.type === 'success') {
        toast.success(config.message, { id })
      } else {
        toast.error(config.message, { id })
      }
    }

    const next = new URLSearchParams(searchParams)
    next.delete(TOAST_PARAM)
    const qs = next.toString()
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false })
  }, [pathname, searchParams, router])

  return null
}
