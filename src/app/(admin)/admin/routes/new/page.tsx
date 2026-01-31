import dynamic from 'next/dynamic'

const RouteForm = dynamic(() => import('@/components/admin/RouteForm'), {
  ssr: true,
  loading: () => (
    <div className="animate-pulse rounded-lg border bg-muted/50 p-8">
      <div className="h-8 w-48 rounded bg-muted" />
      <div className="mt-4 h-4 w-full rounded bg-muted" />
      <div className="mt-4 h-4 w-3/4 rounded bg-muted" />
    </div>
  ),
})

type Props = {
  params: Promise<Record<string, never>>
}

export default async function CreateRoutePage({ params }: Props) {
  await params // Admin routes don't have params, but we await for consistency

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Create New Route</h1>
        <p className="text-muted-foreground">
          Add a new route to the system
        </p>
      </div>
      <div className="max-w-2xl">
        <RouteForm />
      </div>
    </div>
  )
}

