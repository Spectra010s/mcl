'use client'

import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordInput } from '@/components/ui/passwordInput'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Image from 'next/image'
import { toast } from 'sonner'

export default function LoginPage() {
  const [emailOrUsername, setEmailOrUsername] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      let loginEmail = emailOrUsername

      if (!emailOrUsername.includes('@')) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('email')
          .eq('username', emailOrUsername)
          .single()

        if (userError || !userData) {
          throw new Error('Invalid username or password')
        }

        loginEmail = userData.email
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password,
      })

      if (error) throw new Error('An error occurred, please try again')

      router.push('/browse/faculties')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw new Error('An error occurred, please try again')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'Google login failed')
    }
  }

  const handleGithubLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw new Error('An error occurred, please try again')
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : 'GitHub login failed')
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-primary/10 to-secondary/10 p-6 md:p-10">
      <div className="w-full max-w-md">
        <Image src="/logo.svg" alt="MCL" className="h-20 w-auto mx-auto mb-4 object-contain" />
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2 text-center">
            <h1 className="text-3xl font-bold text-primary">My Campus Library</h1>
            <p className="text-muted-foreground mb-6">Access your academic resources</p>
          </div>
          <Card className="border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Welcome Back!</CardTitle>
              <CardDescription>Sign in to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="emailOrUsername">Email or Username</Label>
                  <Input
                    id="emailOrUsername"
                    type="text"
                    placeholder="you@email.com"
                    required
                    value={emailOrUsername}
                    onChange={e => setEmailOrUsername(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <PasswordInput
                    id="password"
                    required
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="border-primary/30"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-primary hover:bg-secondary text-white"
                  disabled={isLoading}
                >
                  {isLoading ? 'Signing in...' : 'Sign in'}
                </Button>
              </form>

              <div className="mt-6">
                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-primary/30"></div>
                  <span className="mx-4 text-sm text-muted-foreground">Or continue with</span>
                  <div className="flex-grow border-t border-primary/30"></div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isLoading}
                    onClick={handleGoogleLogin}
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
                    disabled={isLoading}
                    onClick={handleGithubLogin}
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
                Don&apos;t have an account?{' '}
                <Link href="/signup" className="text-primary font-semibold hover:underline">
                  Create one
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
