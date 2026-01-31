'use server'

import {
  getAdminRoutes,
  createRoute as createRouteShared,
  updateRoute as updateRouteShared,
  rebalanceSeats,
  cancelRoute as cancelRouteShared,
  setRouteHomepagePosition as setRouteHomepagePositionShared,
  deleteRoute as deleteRouteShared,
} from '@/lib/admin/routes-actions'

export type { AdminRoutesResult } from '@/lib/admin/routes-actions'

export { getAdminRoutes, rebalanceSeats }

export async function createRoute(formData: FormData, _locale: string) {
  return createRouteShared(formData, undefined)
}

export async function updateRoute(routeId: string, formData: FormData, _locale: string) {
  return updateRouteShared(routeId, formData, undefined)
}

export async function cancelRoute(routeId: string, _locale: string) {
  return cancelRouteShared(routeId, undefined)
}

export async function setRouteHomepagePosition(routeId: string, position: number | null) {
  return setRouteHomepagePositionShared(routeId, position, undefined)
}

export async function deleteRoute(routeId: string) {
  return deleteRouteShared(routeId, undefined)
}
