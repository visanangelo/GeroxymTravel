'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { linkCustomerAfterSignup } from '@/app/[locale]/signup/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

type Props = {
  locale: string
  prefillEmail: string
}

export default function SignupForm({ locale, prefillEmail }: Props) {
  const router = useRouter()
  const [email, setEmail] = useState(prefillEmail)
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setLoading(true)

    try {
      const supabase = createClient()

      // Sign up with email and password
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/account?tab=bookings`,
        },
      })

      if (signUpError) {
        throw signUpError
      }

      if (data.user) {
        // Link existing customer to user account if customer exists with this email
        try {
          await linkCustomerAfterSignup(email, data.user.id)
        } catch (linkError) {
          console.error('Error linking customer:', linkError)
          // Don't block signup if linking fails
        }

        setMessage(
          'Account created successfully! Please check your email (and spam folder), click the confirmation link, then sign in.'
        )
        setLoading(false)
        // Do not redirect – user must confirm email first; then they sign in
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account')
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sign Up</CardTitle>
        <CardDescription>
          Create a free account to manage your bookings
        </CardDescription>
      </CardHeader>
      <CardContent>
        {message ? (
          <>
            <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400 mb-4">
              {message}
            </div>
            <Link
              href={`/${locale}/login`}
              className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Go to Sign in
            </Link>
          </>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                placeholder="••••••••"
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Password must be at least 6 characters
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>
        )}

        {!message && (
          <div className="mt-4 text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link href={`/${locale}/login`} className="text-primary hover:underline">
              Sign in
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

