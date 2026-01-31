'use client'

import { useState, useRef } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { MoreHorizontal, Eye, Edit, Copy, LayoutGrid, X, Trash2 } from 'lucide-react'
import { cancelRoute, deleteRoute, setRouteHomepagePosition } from '@/lib/admin/routes-actions'
const HOMEPAGE_POSITIONS = [1, 2, 3, 4, 5, 6] as const

type Route = {
  id: string
  origin: string
  destination: string
  status: string
  homepage_position?: number | null
}

type Props = {
  route: Route
  /** When set (e.g. [locale]/admin), paths use /[locale]/admin; omit for (admin) */
  locale?: string
  /** Call after cancel/delete success so the list refetches and updates */
  onActionSuccess?: () => void
}

export function RouteActionsMenu({ route, locale, onActionSuccess }: Props) {
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [positionLoading, setPositionLoading] = useState(false)
  const cancelSubmittingRef = useRef(false)
  const deleteSubmittingRef = useRef(false)

  const handleCancel = async () => {
    if (cancelSubmittingRef.current) return
    cancelSubmittingRef.current = true
    setLoading(true)
    try {
      const result = await cancelRoute(route.id, locale)
      if (result.success) {
        setCancelOpen(false)
        setLoading(false)
        toast.success('Rută anulată', { id: `route-cancelled-${route.id}` })
        onActionSuccess?.()
      } else {
        toast.error(result.error ?? 'Nu s-a putut anula ruta', { id: `route-cancel-error-${route.id}` })
        setLoading(false)
        cancelSubmittingRef.current = false
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nu s-a putut anula ruta', { id: `route-cancel-error-${route.id}` })
      setLoading(false)
      cancelSubmittingRef.current = false
    }
  }

  const handleDelete = async () => {
    if (deleteSubmittingRef.current) return
    deleteSubmittingRef.current = true
    setLoading(true)
    try {
      const result = await deleteRoute(route.id, locale)
      if (result.success) {
        setDeleteOpen(false)
        setLoading(false)
        toast.success('Rută ștearsă', { id: `route-deleted-${route.id}` })
        onActionSuccess?.()
      } else {
        toast.error(result.error ?? 'Nu s-a putut șterge ruta', { id: `route-delete-error-${route.id}` })
        setLoading(false)
        deleteSubmittingRef.current = false
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Nu s-a putut șterge ruta', { id: `route-delete-error-${route.id}` })
      setLoading(false)
      deleteSubmittingRef.current = false
    }
  }

  const handleSetHomepagePosition = (position: number | null) => async (e: Event) => {
    e.preventDefault()
    setPositionLoading(true)
    try {
      const result = await setRouteHomepagePosition(route.id, position, locale)
      if (result.success) {
        setPositionLoading(false)
        toast.success(position === null ? 'Scoasă de pe homepage' : `Setată pe poziția ${position}`, { id: `route-homepage-${route.id}` })
        onActionSuccess?.()
      } else {
        toast.error(result.error ?? 'Nu s-a putut actualiza', { id: `route-homepage-error-${route.id}` })
        setPositionLoading(false)
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Nu s-a putut actualiza', { id: `route-homepage-error-${route.id}` })
      setPositionLoading(false)
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={(e) => e.stopPropagation()}
          >
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52" onClick={(e) => e.stopPropagation()}>
          <DropdownMenuItem asChild>
            <Link href={`/admin/routes/${route.id}`}>
              <Eye className="mr-2 h-4 w-4" />
              View Details
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/routes/${route.id}/edit`}>
              <Edit className="mr-2 h-4 w-4" />
              Edit Route
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href={`/admin/routes/new?duplicate=${route.id}`}>
              <Copy className="mr-2 h-4 w-4" />
              Duplicate
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <LayoutGrid className="mr-2 h-4 w-4" />
              Modifică poziția
              {route.homepage_position != null && (
                <span className="ml-1 text-muted-foreground">({route.homepage_position})</span>
              )}
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent className="w-48">
              {HOMEPAGE_POSITIONS.map((pos) => (
                <DropdownMenuItem
                  key={pos}
                  onSelect={handleSetHomepagePosition(pos)}
                  disabled={positionLoading}
                >
                  <span className={route.homepage_position === pos ? 'font-semibold text-primary' : ''}>
                    Poziția {pos}
                    {route.homepage_position === pos ? ' ✓' : ''}
                  </span>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={handleSetHomepagePosition(null)}
                disabled={positionLoading}
              >
                Scoate de pe homepage
              </DropdownMenuItem>
            </DropdownMenuSubContent>
          </DropdownMenuSub>
          {route.status === 'active' && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onSelect={(e) => {
                  e.preventDefault()
                  setCancelOpen(true)
                }}
              >
                <X className="mr-2 h-4 w-4" />
                Cancel Route
              </DropdownMenuItem>
            </>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onSelect={(e) => {
              e.preventDefault()
              setDeleteOpen(true)
            }}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Delete Route
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={cancelOpen} onOpenChange={setCancelOpen}>
        <DialogContent showCloseButton={!loading}>
          <DialogHeader>
            <DialogTitle>Cancel route</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this route? The route will no longer be available for booking.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelOpen(false)} disabled={loading}>
              No
            </Button>
            <Button variant="destructive" onClick={handleCancel} disabled={loading}>
              {loading ? 'Cancelling…' : 'Yes, cancel route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton={!loading}>
          <DialogHeader>
            <DialogTitle>Delete route</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this route? All related tickets, orders and seats will be removed. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={loading}>
              No
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={loading}>
              {loading ? 'Deleting…' : 'Yes, delete route'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
