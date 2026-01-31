import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { getAdminRoutes } from './actions'
import AdminRoutesListClient from './AdminRoutesListClient'

export const revalidate = 30

export default async function AdminRoutesPage() {
  const { routes: initialRoutes, count: initialCount, error } = await getAdminRoutes({})

  if (error) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive">
          Error loading routes: {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">Routes</h1>
          <p className="text-muted-foreground">
            Manage all available routes and schedules
          </p>
        </div>
        <Link href="/admin/routes/new">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create New Route
          </Button>
        </Link>
      </div>

      <AdminRoutesListClient
        initialRoutes={initialRoutes}
        initialCount={initialCount}
      />
    </div>
  )
}
