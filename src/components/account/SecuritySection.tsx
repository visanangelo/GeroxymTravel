import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import LogoutButton from './LogoutButton'
import { Shield, Lock } from 'lucide-react'

type Props = {
  locale: string
}

export default function SecuritySection({ locale }: Props) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader>
        <CardTitle className="text-xl font-semibold flex items-center gap-2">
          <Shield className="h-5 w-5 text-muted-foreground" />
          Security
        </CardTitle>
        <CardDescription>
          Manage your account security and authentication
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Lock className="h-4 w-4" />
            <span>Password & Authentication</span>
          </div>
          <p className="text-xs text-muted-foreground ml-6">
            Password changes and authentication settings will be available soon.
            Contact support if you need to update your password.
          </p>
        </div>

        <div className="pt-4 border-t">
          <LogoutButton locale={locale} />
        </div>
      </CardContent>
    </Card>
  )
}

