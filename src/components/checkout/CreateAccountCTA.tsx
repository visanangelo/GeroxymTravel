'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { UserPlus, Mail, Lock } from 'lucide-react'
import Link from 'next/link'

type Props = {
  locale: string
  customerEmail: string
}

export default function CreateAccountCTA({ locale, customerEmail }: Props) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardHeader>
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-primary" />
          <CardTitle>Create an Account (Optional)</CardTitle>
        </div>
        <CardDescription>
          Create a free account to manage your bookings, view ticket history, and get faster checkout next time.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!showDetails ? (
          <>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4" />
                <span>We'll use your email: <strong>{customerEmail}</strong></span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4" />
                <span>Secure password setup or magic link</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDetails(true)}
                variant="outline"
                className="flex-1"
              >
                Learn More
              </Button>
              <Link href={`/${locale}/signup?email=${encodeURIComponent(customerEmail)}`} className="flex-1">
                <Button className="w-full">
                  Create Account
                </Button>
              </Link>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3 text-sm">
              <div>
                <strong>Benefits of creating an account:</strong>
              </div>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground ml-2">
                <li>View all your bookings in one place</li>
                <li>Manage and cancel tickets easily</li>
                <li>Faster checkout for future bookings</li>
                <li>Receive booking confirmations and updates</li>
                <li>Access exclusive deals and promotions</li>
              </ul>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowDetails(false)}
                variant="ghost"
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Link href={`/${locale}/signup?email=${encodeURIComponent(customerEmail)}`} className="flex-1">
                <Button className="w-full">
                  Create Account Now
                </Button>
              </Link>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

