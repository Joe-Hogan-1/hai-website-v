"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"
import { trackPageView } from "@/utils/cookies"
import { trackPageViewInSupabase } from "@/utils/user-data"

export default function AnalyticsTracker() {
  const pathname = usePathname()

  useEffect(() => {
    // Only track if user has consented to cookies
    if (document.cookie.includes("cookie_consent=true")) {
      try {
        // Track page view in cookies
        trackPageView(pathname)

        // Track page view in Supabase with error handling
        trackPageViewInSupabase(pathname).catch((err) => {
          // Silent error handling - errors are already logged in the function
          console.warn("Failed to track page view, continuing without analytics")
        })
      } catch (error) {
        // Catch any unexpected errors to prevent breaking the app
        console.error("Unexpected error in analytics tracking:", error)
      }
    }
  }, [pathname])

  return null // This component doesn't render anything
}
