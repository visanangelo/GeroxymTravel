'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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

/** Info despre pozițiile ocupate pe homepage */
type OccupiedPosition = {
  position: number
  routeId: string
  routeName: string // ex: "București → Constanța"
}

type Props = {
  route: Route
  locale?: string
  onActionSuccess?: () => void
  onPositionChange?: (routeId: string, newPosition: number | null) => void
  onOptimisticCancel?: (route: Route) => void
  /** Revert la eroare (refetch listă). */
  onRevertCancel?: () => void
  /** Optimistic: scoate ruta din listă. La eroare: onRevertDelete() (ex: refetch). */
  onOptimisticDelete?: (route: Route) => void
  onRevertDelete?: () => void
  occupiedPositions?: OccupiedPosition[]
}

export function RouteActionsMenu({
  route,
  locale,
  onActionSuccess,
  onPositionChange,
  onOptimisticCancel,
  onRevertCancel,
  onOptimisticDelete,
  onRevertDelete,
  occupiedPositions = [],
}: Props) {
  const router = useRouter()
  const [cancelOpen, setCancelOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [positionSubmitting, setPositionSubmitting] = useState(false)
  const cancelSubmittingRef = useRef(false)
  const deleteSubmittingRef = useRef(false)
  const positionSubmittingRef = useRef(false)
  const isMountedRef = useRef(true)

  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  const handleCancel = async () => {
    if (cancelSubmittingRef.current) return
    cancelSubmittingRef.current = true
    setCancelOpen(false)

    if (onOptimisticCancel) {
      onOptimisticCancel(route)
      toast.success('Rută anulată', { id: `route-cancelled-${route.id}` })
    } else {
      setLoading(true)
    }

    try {
      const result = await cancelRoute(route.id, locale)
      if (!isMountedRef.current) return
      if (result.success) {
        onActionSuccess?.()
        router.refresh()
      } else {
        if (onRevertCancel) onRevertCancel()
        toast.error(result.error ?? 'Nu s-a putut anula ruta', { id: `route-cancel-error-${route.id}` })
      }
    } catch (e) {
      if (isMountedRef.current) {
        if (onRevertCancel) onRevertCancel()
        toast.error(e instanceof Error ? e.message : 'Nu s-a putut anula ruta', { id: `route-cancel-error-${route.id}` })
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
      cancelSubmittingRef.current = false
    }
  }

  const handleDelete = async () => {
    if (deleteSubmittingRef.current) return
    deleteSubmittingRef.current = true
    setDeleteOpen(false)

    if (onOptimisticDelete) {
      onOptimisticDelete(route)
      toast.success('Rută ștearsă', { id: `route-deleted-${route.id}` })
    } else {
      setLoading(true)
    }

    try {
      const result = await deleteRoute(route.id, locale)
      if (!isMountedRef.current) return
      if (result.success) {
        onActionSuccess?.()
        router.refresh()
      } else {
        if (onRevertDelete) onRevertDelete()
        toast.error(result.error ?? 'Nu s-a putut șterge ruta', { id: `route-delete-error-${route.id}` })
      }
    } catch (e) {
      if (isMountedRef.current) {
        if (onRevertDelete) onRevertDelete()
        toast.error(e instanceof Error ? e.message : 'Nu s-a putut șterge ruta', { id: `route-delete-error-${route.id}` })
      }
    } finally {
      if (isMountedRef.current) setLoading(false)
      deleteSubmittingRef.current = false
    }
  }

  const handleSetHomepagePosition = (position: number | null) => async (e: Event) => {
    e.preventDefault()
    if (positionSubmittingRef.current) return
    positionSubmittingRef.current = true
    setPositionSubmitting(true)

    try {
      const result = await setRouteHomepagePosition(route.id, position, locale)
      if (!isMountedRef.current) return
      if (result.success) {
        onPositionChange?.(route.id, position)
        router.refresh()
        toast.success(position === null ? 'Scoasă de pe homepage' : `Setată pe poziția ${position}`, { id: `route-homepage-${route.id}` })
      } else {
        toast.error(result.error ?? 'Nu s-a putut actualiza', { id: `route-homepage-error-${route.id}` })
      }
    } catch (err) {
      if (isMountedRef.current) {
        toast.error(err instanceof Error ? err.message : 'Nu s-a putut actualiza', { id: `route-homepage-error-${route.id}` })
      }
    } finally {
      positionSubmittingRef.current = false
      if (isMountedRef.current) setPositionSubmitting(false)
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
            <DropdownMenuSubContent className="w-64">
              {HOMEPAGE_POSITIONS.map((pos) => {
                const currentPos = route.homepage_position != null ? Number(route.homepage_position) : null
                const isOccupiedByThisRoute = occupiedPositions.some(o => Number(o.position) === pos && o.routeId === route.id)
                const isCurrentRoute = currentPos === pos || isOccupiedByThisRoute
                const occupiedBy = occupiedPositions.find(o => Number(o.position) === pos && o.routeId !== route.id)
                
                return (
                  <DropdownMenuItem
                    key={pos}
                    disabled={positionSubmitting}
                    onSelect={handleSetHomepagePosition(pos)}
                    className="flex flex-col items-start gap-0.5 py-2"
                  >
                    <span className={isCurrentRoute ? 'font-semibold text-primary' : ''}>
                      Poziția {pos}
                      {isCurrentRoute && ' ✓'}
                    </span>
                    {occupiedBy && (
                      <span className="text-xs text-muted-foreground truncate max-w-full">
                        {occupiedBy.routeName}
                      </span>
                    )}
                    {!occupiedBy && !isCurrentRoute && (
                      <span className="text-xs text-green-600 dark:text-green-400">
                        Disponibilă
                      </span>
                    )}
                  </DropdownMenuItem>
                )
              })}
              <DropdownMenuSeparator />
              <DropdownMenuItem disabled={positionSubmitting} onSelect={handleSetHomepagePosition(null)}>
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
