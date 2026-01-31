'use client'

import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { Toaster } from 'sonner'

const TOASTER_Z = 2147483647

/**
 * Montează Toaster-ul într-un portal direct în document.body.
 * Containerul e mutat la sfârșitul body când apar noi copii (ex. Sheet/Dialog),
 * astfel toast-urile rămân mereu deasupra.
 */
export function ToasterPortal() {
  const [container, setContainer] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = document.createElement('div')
    el.setAttribute('aria-hidden', 'true')
    el.style.cssText = [
      'position:fixed',
      'inset:0',
      `z-index:${TOASTER_Z}`,
      'pointer-events:none',
    ].join(';')
    document.body.appendChild(el)
    setContainer(el)

    const observer = new MutationObserver(() => {
      if (el.parentNode === document.body && document.body.lastChild !== el) {
        document.body.appendChild(el)
      }
    })
    observer.observe(document.body, { childList: true, subtree: false })

    return () => {
      observer.disconnect()
      if (el.parentNode) document.body.removeChild(el)
    }
  }, [])

  if (!container) return null

  return createPortal(
    <Toaster position="top-right" richColors closeButton />,
    container
  )
}
