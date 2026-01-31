'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useRef, useTransition } from 'react'
import {
  LayoutDashboard,
  Route,
  Plus,
  ShoppingCart,
  Ticket,
  LogOut,
  Home,
} from 'lucide-react'
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { prefetchAdminData } from '@/lib/admin-prefetch'

type Props = {
  locale: string // Used only for date formatting and logout redirect, not in URLs
}

// Admin routes without locale (optimized for instant navigation)
const menuItems = [
  {
    title: 'Dashboard',
    icon: LayoutDashboard,
    href: '/admin',
  },
  {
    title: 'Routes',
    icon: Route,
    href: '/admin/routes',
  },
  {
    title: 'Create Route',
    icon: Plus,
    href: '/admin/routes/new',
  },
  {
    title: 'Orders',
    icon: ShoppingCart,
    href: '/admin/orders',
  },
  {
    title: 'Tickets',
    icon: Ticket,
    href: '/admin/tickets',
  },
]

export function AdminSidebar({ locale }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const prefetchTimeoutRef = useRef<Map<string, NodeJS.Timeout>>(new Map())

  // Aggressive prefetching: prefetch all admin routes on mount and on visibility
  useEffect(() => {
    // Prefetch all admin routes immediately (no locale in path = faster)
    menuItems.forEach((item) => {
      router.prefetch(item.href)
    })

    // Prefetch on visibility change (when user comes back to tab)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        menuItems.forEach((item) => {
          router.prefetch(item.href)
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [router])

  // Prefetch on hover with debounce for better performance
  const handleMouseEnter = (href: string) => {
    // Clear existing timeout if any
    const existingTimeout = prefetchTimeoutRef.current.get(href)
    if (existingTimeout) {
      clearTimeout(existingTimeout)
    }

    // Prefetch page immediately on hover
    router.prefetch(href)
    
    // Also prefetch data for instant loading
    // Use requestIdleCallback for non-blocking prefetch
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        prefetchAdminData(href)
      }, { timeout: 100 })
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetchAdminData(href)
      }, 0)
    }
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push(`/${locale}/login`)
    router.refresh()
  }

  return (
    <Sidebar>
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">G</span>
          </div>
          <div>
            <div className="font-bold text-sm">Geroxym Travel</div>
            <div className="text-xs text-muted-foreground">Admin Panel</div>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => {
                const href = item.href
                const isActive = pathname === href || pathname?.startsWith(href + '/')
                const Icon = item.icon

                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link
                        href={href}
                        prefetch={true}
                        onMouseEnter={() => handleMouseEnter(href)}
                        className="transition-transform duration-100 will-change-transform"
                        style={{
                          transform: isPending && pathname !== href ? 'scale(0.98) translateZ(0)' : 'scale(1) translateZ(0)',
                        }}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 space-y-1">
        <Button variant="ghost" className="w-full justify-start" asChild>
          <Link href={`/${locale}`}>
            <Home className="h-4 w-4 mr-2" />
            Homepage
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </SidebarFooter>
    </Sidebar>
  )
}
