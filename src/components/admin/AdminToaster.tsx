'use client'

import { Toaster } from 'sonner'

export function AdminToaster() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      visibleToasts={3}
      toastOptions={{
        duration: 4500,
        classNames: {
          toast: 'rounded-xl border border-border shadow-lg backdrop-blur-sm',
          title: 'font-semibold',
          description: 'text-muted-foreground text-sm',
          success: 'bg-card text-foreground',
          error: 'bg-destructive/10 text-destructive border-destructive/20',
          actionButton: 'bg-primary text-primary-foreground',
          cancelButton: 'bg-muted text-muted-foreground',
        },
      }}
    />
  )
}
