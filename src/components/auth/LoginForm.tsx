'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Loader2 } from 'lucide-react'

type Props = {
  locale: string
  initialError?: string
  /** Optional redirect path after OAuth (e.g. /ro/account). Defaults to account. */
  redirectTo?: string
  /** Show "Please verify your email" message (e.g. after redirect from account). */
  confirmEmailMessage?: boolean
}

export default function LoginForm({ locale, initialError, redirectTo, confirmEmailMessage = false }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(initialError || null)
  const [emailNotConfirmed, setEmailNotConfirmed] = useState(!!confirmEmailMessage)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendSent, setResendSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState<'google' | 'facebook' | null>(null)
  const [isSignUp, setIsSignUp] = useState(false)
  const [signUpNeedsConfirmation, setSignUpNeedsConfirmation] = useState(false)

  const unconfirmedMessage =
    'Please verify your email first. Check your inbox (and spam folder) and click the confirmation link, then sign in. You can resend the link below.'

  const defaultRedirect = `/${locale}/account`
  const nextPath = redirectTo ?? defaultRedirect

  async function handleOAuthSignIn(provider: 'google' | 'facebook') {
    setError(null)
    setOauthLoading(provider)
    try {
      const supabase = createClient()
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(nextPath)}`,
        },
      })
      if (oauthError) {
        setError(oauthError.message)
        setOauthLoading(null)
        return
      }
      // signInWithOAuth redirects to provider; no need to router.push
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
      setOauthLoading(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setEmailNotConfirmed(false)
    setSignUpNeedsConfirmation(false)
    setLoading(true)

    try {
      const supabase = createClient()

      if (isSignUp) {
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        })

        if (signUpError) {
          setError(signUpError.message)
          setLoading(false)
          return
        }

        // If email must be confirmed, do NOT call signInWithPassword – Supabase returns 400 "Email not confirmed"
        const user = signUpData?.user
        const needsConfirmation = user && !user.email_confirmed_at
        if (needsConfirmation) {
          setSignUpNeedsConfirmation(true)
          setLoading(false)
          return
        }

        // Confirm email is off or already confirmed – sign in and redirect
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          setError(signInError.message)
          setLoading(false)
          return
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (signInError) {
          const isEmailNotConfirmed =
            signInError.message?.toLowerCase().includes('email not confirmed') ||
            signInError.message?.toLowerCase().includes('email_not_confirmed')
          if (isEmailNotConfirmed) {
            setEmailNotConfirmed(true)
            setError(
              'Your email is not confirmed yet. Check your inbox and click the confirmation link, or resend it below.'
            )
          } else {
            setError(signInError.message)
          }
          setLoading(false)
          return
        }
      }

      // Sign-in succeeded – full page navigation so UI doesn't stay on loading
      // (router.push + refresh can leave form stuck; account page redirects admins to /admin).
      setLoading(false)
      window.location.href = nextPath
    } catch (err) {
      setError('An unexpected error occurred')
      setLoading(false)
    }
  }

  async function handleResendConfirmation() {
    if (!email?.trim()) return
    setResendLoading(true)
    setResendSent(false)
    setError(null)
    try {
      const supabase = createClient()
      const { error: resendError } = await supabase.auth.resend({
        type: 'signup',
        email: email.trim(),
      })
      if (resendError) {
        setError(resendError.message)
      } else {
        setResendSent(true)
      }
    } catch {
      setError('Failed to resend confirmation email')
    } finally {
      setResendLoading(false)
    }
  }

  if (signUpNeedsConfirmation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>Almost there – verify your email</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-md bg-green-500/10 p-4 text-sm text-green-700 dark:text-green-400">
            Account created. Please check your email (and spam folder), click the confirmation link, then sign in.
          </div>
          <Button
            type="button"
            className="inline-flex w-full items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            onClick={() => {
              // Switch back to login view on the same page
              setSignUpNeedsConfirmation(false)
              setIsSignUp(false)
              setError(null)
              setEmailNotConfirmed(false)
              setResendSent(false)
            }}
          >
            Go to Sign in
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{isSignUp ? 'Create Account' : 'Admin Login'}</CardTitle>
        <CardDescription>
          {isSignUp
            ? 'Create an account to access the admin panel'
            : 'Sign in to access the admin dashboard'}
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          {(error || (emailNotConfirmed && confirmEmailMessage)) && (
            <div className={`rounded-md p-3 text-sm ${error && !confirmEmailMessage ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
              {confirmEmailMessage && !error ? unconfirmedMessage : error}
            </div>
          )}
          {emailNotConfirmed && email && (
            <div className="space-y-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-full"
                disabled={resendLoading}
                onClick={handleResendConfirmation}
              >
                {resendLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending…
                  </>
                ) : resendSent ? (
                  'Email sent – check your inbox'
                ) : (
                  'Resend confirmation email'
                )}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuthSignIn('google')}
            >
              {oauthLoading === 'google' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Google'
              )}
            </Button>
            <Button
              type="button"
              variant="outline"
              className="w-full"
              disabled={loading || !!oauthLoading}
              onClick={() => handleOAuthSignIn('facebook')}
            >
              {oauthLoading === 'facebook' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Facebook'
              )}
            </Button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">sau cu email</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
              minLength={6}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Loading...' : isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              setIsSignUp(!isSignUp)
              setError(null)
            }}
            disabled={loading}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}

