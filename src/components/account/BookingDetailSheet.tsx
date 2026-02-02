'use client'

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { Sheet, SheetContent, SheetFooter, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { formatCurrency } from '@/lib/utils'
import { copyToClipboardCrossBrowser } from '@/lib/copyToClipboard'
import { getSeatLabel } from '@/lib/bus-layout'
import {
  Calendar,
  Ticket,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  Hash,
  Receipt,
  Users,
  Copy,
  Check,
} from 'lucide-react'
import type { OrderWithDetails } from './AccountClient'

type Props = {
  order: OrderWithDetails | null
  locale: string
  open: boolean
  onClose: () => void
}

function StatusPill({ status }: { status: string }) {
  if (status === 'paid') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-medium tracking-wide text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
        <CheckCircle2 className="h-3.5 w-3.5" />
        Paid
      </span>
    )
  }
  if (status === 'created') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium tracking-wide text-amber-700 dark:text-amber-400 border border-amber-500/20">
        <Clock className="h-3.5 w-3.5" />
        Pending payment
      </span>
    )
  }
  if (status === 'cancelled') {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/10 px-3 py-1 text-xs font-medium tracking-wide text-red-700 dark:text-red-400 border border-red-500/20">
        <XCircle className="h-3.5 w-3.5" />
        Cancelled
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
      {status}
    </span>
  )
}

const COPY_FEEDBACK_MS = 2000
const COPY_DEBOUNCE_MS = 600

export default function BookingDetailSheet({ order, locale, open, onClose }: Props) {
  const [copyState, setCopyState] = useState<'idle' | 'success' | 'error'>('idle')
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const lastCopyAtRef = useRef(0)
  const orderIdInputRef = useRef<HTMLInputElement>(null)

  const selectAllOrderId = () => {
    orderIdInputRef.current?.focus()
    orderIdInputRef.current?.setSelectionRange(0, orderIdInputRef.current.value.length)
    orderIdInputRef.current?.select()
  }

  useEffect(() => () => {
    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
  }, [])

  if (!order) return null

  const route = order.routes as { capacity_total?: number } | null
  const tickets = (order.tickets || []) as Array<{ seat_no: number }>
  const seatNumbers = tickets.map((t) => t.seat_no).sort((a, b) => a - b)
  const capacityTotal = route?.capacity_total
  const departDate = route?.depart_at
    ? new Date(route.depart_at).toLocaleString(locale, {
        dateStyle: 'long',
        timeStyle: 'short',
      })
    : null
  const bookingDate = new Date(order.created_at).toLocaleDateString(locale, {
    dateStyle: 'medium',
  })

  const copyOrderId = () => {
    const now = Date.now()
    if (now - lastCopyAtRef.current < COPY_DEBOUNCE_MS) return
    lastCopyAtRef.current = now

    if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current)
    const setSuccess = () => {
      setCopyState('success')
      copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), COPY_FEEDBACK_MS)
    }
    const setError = () => {
      setCopyState('error')
      copyTimeoutRef.current = setTimeout(() => setCopyState('idle'), COPY_FEEDBACK_MS)
    }

    const ok = copyToClipboardCrossBrowser(order.id)
    if (ok) setSuccess()
    else setError()
  }

  return (
    <Sheet open={open} onOpenChange={(o) => !o && onClose()}>
      <SheetContent
        side="right"
        className="w-full overflow-y-auto border-l bg-background sm:max-w-lg p-0 flex flex-col shadow-xl"
        onPointerDownOutside={onClose}
      >
        <SheetTitle className="sr-only">
          Booking details — {route?.origin} to {route?.destination}
        </SheetTitle>
        {/* Hero: route + status */}
        <div className="relative border-b bg-muted px-6 pt-8 pb-6">
          <div className="absolute left-6 top-6 w-8 h-px bg-primary/60" aria-hidden />
          <p className="mb-1 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
            Booking
          </p>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <h2 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              {route?.origin}
              <span className="mx-2 text-muted-foreground">→</span>
              {route?.destination}
            </h2>
            <StatusPill status={order.status} />
          </div>
          {departDate && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4 shrink-0 text-primary/80" />
              <span>{departDate}</span>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          {/* Info cards */}
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Receipt className="h-3.5 w-3.5" />
                  Total
                </div>
                <p className="mt-1.5 text-lg font-semibold text-foreground">
                  {formatCurrency(order.amount_cents / 100, order.currency)}
                </p>
              </div>
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  Passengers
                </div>
                <p className="mt-1.5 text-lg font-semibold text-foreground">
                  {order.quantity} ticket{order.quantity > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            {seatNumbers.length > 0 && (
              <div className="rounded-xl border bg-card p-4">
                <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  <Ticket className="h-3.5 w-3.5" />
                  Seats
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {seatNumbers.map((seatNo) => (
                    <span
                      key={seatNo}
                      className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5 font-mono text-sm font-medium text-foreground"
                    >
                      {getSeatLabel(seatNo, capacityTotal)}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="rounded-xl border bg-card p-4">
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                <Hash className="h-3.5 w-3.5" />
                Order ID
              </div>
              {/* La tap/focus selectăm tot textul – pe iPhone apeși Copiază din meniu, fără să muți săgețile */}
              <input
                ref={orderIdInputRef}
                type="text"
                readOnly
                value={order.id}
                onFocus={selectAllOrderId}
                onClick={selectAllOrderId}
                onTouchEnd={(e) => {
                  const target = e.currentTarget
                  requestAnimationFrame(() => {
                    target.focus()
                    target.setSelectionRange(0, target.value.length)
                  })
                }}
                className="mt-2 w-full rounded-lg border border-transparent bg-muted px-3 py-3 font-mono text-sm text-foreground focus:border-ring focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                style={{ WebkitUserSelect: 'text', userSelect: 'text' }}
                aria-label="Order ID"
              />
              <div className="mt-2 hidden items-center gap-2 sm:flex">
                <button
                  type="button"
                  onClick={copyOrderId}
                  onTouchStart={(e) => {
                    e.preventDefault()
                    copyOrderId()
                  }}
                  className="flex h-11 min-w-[44px] items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 touch-manipulation active:opacity-80 [-webkit-tap-highlight-color:transparent]"
                  style={{ touchAction: 'none' }}
                  aria-label="Copy order ID"
                >
                  {copyState === 'success' ? (
                    <Check className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="h-5 w-5 text-muted-foreground" />
                  )}
                  <span className="text-sm font-medium">Copiază</span>
                </button>
                {(copyState === 'success' || copyState === 'error') && (
                  <span
                    className={`text-sm font-medium ${copyState === 'success' ? 'text-emerald-600 dark:text-emerald-400' : 'text-destructive'}`}
                    role={copyState === 'success' ? 'status' : 'alert'}
                  >
                    {copyState === 'success' ? 'Copiat!' : 'Nu s-a putut copia'}
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                Pe iPhone: apasă pe câmpul cu ID (se selectează tot), apoi «Copiază» din meniu.
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Booked on {bookingDate}
              </p>
            </div>
          </div>
        </div>

        <SheetFooter className="flex-shrink-0 gap-2 border-t bg-muted px-6 py-4">
          <Button variant="outline" onClick={onClose} className="w-full sm:w-auto" size="lg">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          {order.status === 'created' && (
            <Button asChild className="w-full sm:w-auto" size="lg">
              <Link href={`/${locale}/checkout/${order.id}`} onClick={onClose}>
                Complete payment
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          )}
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
