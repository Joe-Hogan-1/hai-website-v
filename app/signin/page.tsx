"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import WaterBackground from "@/components/water-background"
import Logo from "@/components/logo"
import Link from "next/link"

export default function SignIn() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const { signIn, user, isLoading: authLoading } = useAuth()
  const router = useRouter()

  // Handle redirect if already logged in
  useEffect(() => {
    if (!authLoading && user && !isRedirecting) {
      setIsRedirecting(true)
      router.push("/dashboard")
    }
  }, [user, authLoading, router, isRedirecting])

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()

    if (isLoading || isRedirecting) return

    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)

      if (error) {
        toast.error(error.message || "Failed to sign in")
      } else {
        toast.success("Signed in successfully")
        setIsRedirecting(true)
        // Add a slight delay to ensure state updates before redirect
        setTimeout(() => {
          router.push("/dashboard")
        }, 100)
      }
    } catch (error) {
      toast.error("An unexpected error occurred")
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  // If we're already logged in and waiting for redirect, show loading
  if (!authLoading && user) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Already logged in</h2>
          <p className="mb-4">Redirecting to dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <WaterBackground />
      <div className="flex min-h-screen flex-col items-center justify-center p-4">
        <div className="mb-8">
          <Logo />
        </div>

        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center text-[#ffd6c0]">Sign In</CardTitle>
            <CardDescription className="text-center">Enter your credentials to access the dashboard</CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  disabled={isLoading || isRedirecting}
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label htmlFor="password" className="text-sm font-medium">
                    Password
                  </label>
                </div>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  disabled={isLoading || isRedirecting}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-[#ffd6c0] hover:bg-[#ffcbb0]"
                disabled={isLoading || isRedirecting || authLoading}
              >
                {isLoading ? "Signing in..." : isRedirecting ? "Redirecting..." : "Sign In"}
              </Button>

              <div className="text-center text-sm">
                <Link href="/" className="text-[#a8d1e7] hover:underline">
                  Back to home
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </>
  )
}
