'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { LogOut } from 'lucide-react'

type Props = {
  locale: string
}

export default function LogoutButton({ locale }: Props) {
  async function handleLogout() {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
    } catch (e) {
      console.error('Logout error:', e)
    }
    // Full page navigation so server sees cleared session
    window.location.href = `/${locale}/login`
  }

  return (
    <Button variant="outline" onClick={handleLogout}>
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </Button>
  )
}

