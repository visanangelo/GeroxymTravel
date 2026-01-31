import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/lib/supabase/server'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AdminSidebar } from '@/components/admin/AdminSidebar'
import { AdminTopbar } from '@/components/admin/AdminTopbar'
import { AdminPageSkeleton } from '@/components/admin/AdminPageSkeleton'
import { AdminToaster } from '@/components/admin/AdminToaster'
import { AdminToastFromUrl } from '@/components/admin/AdminToastFromUrl'

type Props = {
  children: React.ReactNode
}

// Default locale for admin (no locale in URL)
const DEFAULT_LOCALE = 'ro'

export default async function AdminLayout({ children }: Props) {
  // Check authentication and admin role (middleware should handle this, but double-check)
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/${DEFAULT_LOCALE}/login`)
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    redirect(`/${DEFAULT_LOCALE}`)
  }

  return (
    <SidebarProvider>
      <AdminSidebar locale={DEFAULT_LOCALE} />
      <SidebarInset>
        <AdminTopbar userEmail={user.email} />
        <Suspense fallback={null}>
          <AdminToastFromUrl />
        </Suspense>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:p-6 admin-page-transition" style={{ contentVisibility: 'auto' }}>
          <Suspense fallback={<AdminPageSkeleton />}>{children}</Suspense>
        </main>
      </SidebarInset>
      <AdminToaster />
    </SidebarProvider>
  )
}
