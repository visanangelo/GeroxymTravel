import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Calendar, Mail, Phone, User as UserIcon } from 'lucide-react'

type Props = {
  fullName: string
  email: string
  phone: string
  memberSince?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export default function ProfileCard({ fullName, email, phone, memberSince }: Props) {
  const initials = getInitials(fullName)

  return (
    <Card className="border-0 shadow-sm bg-gradient-to-br from-background to-muted/20">
      <CardContent className="p-8">
        <div className="flex flex-col sm:flex-row gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <Avatar className="h-20 w-20 border-2 border-border/50 shadow-sm">
              <AvatarFallback className="bg-primary/10 text-primary text-xl font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Profile Info */}
          <div className="flex-1 space-y-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-2xl font-semibold tracking-tight">{fullName}</h2>
                <Badge variant="secondary" className="bg-green-500/10 text-green-700 dark:text-green-400 border-green-500/20">
                  Active
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Mail className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{email}</span>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground">
                <Phone className="h-4 w-4 flex-shrink-0" />
                <span className="text-sm">{phone}</span>
              </div>
              {memberSince && (
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="h-4 w-4 flex-shrink-0" />
                  <span className="text-sm">Member since {memberSince}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

