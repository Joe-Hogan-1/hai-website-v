"use client"

import { createContext, useContext, useEffect, useState, useRef, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { getBrowserClient } from "@/lib/supabase-client"
import type { Session, User } from "@supabase/supabase-js"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signIn: (email: string, password: string) => Promise<{ error: any | null }>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getBrowserClient()

  // Use a ref to track if we've already redirected to prevent loops
  const hasRedirected = useRef(false)

  useEffect(() => {
    // Reset the redirect flag when the pathname changes
    hasRedirected.current = false
  }, [pathname])

  useEffect(() => {
    // Check active session
    const checkSession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession()
        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error checking session:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase.auth])

  // Handle redirects based on auth state
  useEffect(() => {
    // Only proceed if not loading and we haven't already redirected
    if (!isLoading && !hasRedirected.current) {
      const isDashboardRoute = pathname === "/dashboard" || pathname.startsWith("/dashboard/")
      const isAuthRoute = pathname === "/signin"

      if (isDashboardRoute && !user) {
        // User is trying to access dashboard but is not logged in
        hasRedirected.current = true
        router.push("/signin")
      } else if (isAuthRoute && user) {
        // User is on login page but is already logged in
        hasRedirected.current = true
        router.push("/dashboard")
      }
    }
  }, [isLoading, user, pathname, router])

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      return { error }
    } catch (error) {
      return { error }
    }
  }

  const signOut = async () => {
    await supabase.auth.signOut()
    router.push("/signin")
  }

  const value = {
    user,
    session,
    isLoading,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
