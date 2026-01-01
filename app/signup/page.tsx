'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/passwordInput'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'
import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

type InputEvent = React.ChangeEvent<HTMLInputElement>


function SignUpContent() {
  const [fullName, setFullName] = useState('')
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [emailConfirmationSent, setEmailConfirmationSent] = useState(false)
  const searchParams = useSearchParams()
  const returnTo = searchParams.get('returnTo') || '/browse/faculties'
  const supabase = createClient()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    if (password !== confirmPassword) {
      toast.error('Passwords do not match')
      setIsLoading(false)
      return
    }

    try {
      const { data: existingUser } = await supabase
        .from('users')
        .select('id')
        .eq('username', username)
        .single()

      if (existingUser) {
        throw new Error('username_taken')
      }

      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: process.env.NEXT_PUBLIC_REDIRECT_URL,
          data: {
            username: username,
            first_name: fullName.split(' ')[0],
            last_name: fullName.split(' ').slice(1).join(' '),
          },
        },
      })

      if (authError) {
        const errorMessage = authError.message.toLowerCase()
        if (errorMessage.includes('already')) {
          throw new Error('email_taken')
        } else if (errorMessage.includes('email')) {
          throw new Error('invalid_email')
        }
        throw authError
      }

      setEmailConfirmationSent(true)
    } catch (error: unknown) {
      if (error instanceof Error) {
        switch (error.message) {
          case 'email_taken':
            toast.error('Email Already Registered', {
              description:
                'An account with this email already exists. Please use a different email or log in.',
            })
            break
          case 'username_taken':
            toast.error('Username Taken', {
              description:
                'An account with this username already exists. Please choose a different one.',
            })
            break
          case 'invalid_email':
            toast.error('Invalid Email', {
              description: 'Please enter a valid email address.',
            })
            break
          default:
            toast.error('Sign Up Failed', {
              description: error.message || 'An error occurred during sign up. Please try again.',
            })
        }
      } else {
        toast.error('Sign Up Failed', {
          description: 'An unexpected error occurred. Please try again.',
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignup = async () => {
    try {
      setIsLoading(true)
      const callbackUrl = `${process.env.NEXT_PUBLIC_REDIRECT_URL}?next=${encodeURIComponent(returnTo)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: callbackUrl,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Google signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGithubSignup = async () => {
    try {
      setIsLoading(true)
      const callbackUrl = `${process.env.NEXT_PUBLIC_REDIRECT_URL}?next=${encodeURIComponent(returnTo)}`
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: callbackUrl,
        },
      })
      if (error) throw error
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'GitHub signup failed')
    } finally {
      setIsLoading(false)
    }
  }

  if (emailConfirmationSent) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6 md:p-10">
        <div className="w-full max-w-md">
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-green-600" />
                Check Your Email
              </CardTitle>
              <CardDescription>Verification link sent</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-foreground">
                We&apos;ve sent a verification link to <strong>{email}</strong>. Click the link in
                the email to complete your account setup.
              </p>
              <p className="text-sm text-muted-foreground">
                Once verified, you can start browsing and contributing resources!
              </p>
              <Link href={returnTo} className="block">
                <Button className="w-full bg-primary hover:bg-secondary">
                  Continue to Library
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6 md:p-10">
      <div className="w-full max-w-md">
        <div className="relative h-20 w-full mb-4">
          <Image
            src="/logo.svg"
            alt="MCL"
            width={200}
            height={80}
            className="h-full w-auto mx-auto object-contain"
            priority
          />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold text-primary">My Campus Library</h1>
            <p className="text-muted-foreground">Join our academic community</p>
          </div>

          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Create Account</CardTitle>
              <CardDescription>Sign up to contribute and download resources</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSignUp} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="e.g.Adetayo Ade"
                    required
                    value={fullName}
                    onChange={(e: InputEvent) => setFullName(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="e.g. Spectra010s"
                    required
                    value={username}
                    onChange={(e: InputEvent) => setUsername(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@email.com"
                    required
                    value={email}
                    onChange={(e: InputEvent) => setEmail(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    placeholder="Create a strong password"
                    required
                    value={password}
                    onChange={(e: InputEvent) => setPassword(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <PasswordInput
                    id="confirmPassword"
                    placeholder="Confirm your password"
                    required
                    value={confirmPassword}
                    onChange={(e: InputEvent) => setConfirmPassword(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating account...' : 'Sign up'}
                </Button>
              </form>
              <div className="mt-6">
                <div className="relative flex items-center my-6">
                  <div className="grow border-t border-primary/30"></div>
                  <span className="mx-4 text-sm text-muted-foreground">Or continue with</span>
                  <div className="grow border-t border-primary/30"></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGoogleSignup}
                    className="border-primary/30 bg-transparent"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                    </svg>
                    Google
                  </Button>

                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleGithubSignup}
                    className="border-primary/30 bg-transparent"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path
                        fillRule="evenodd"
                        clipRule="evenodd"
                        d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.115 22 16.379 22 12.017 22 6.484 17.522 2 12 2z"
                      />
                    </svg>
                    GitHub
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{' '}
                <Link href={`/login${returnTo !== '/browse/faculties' ? `?returnTo=${encodeURIComponent(returnTo)}` : ''}`} className="text-primary font-semibold hover:underline">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function SignUpPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6 md:p-10">
      <Suspense fallback={<div>Loading...</div>}>
        <SignUpContent />
      </Suspense>
    </div>
  )
}
