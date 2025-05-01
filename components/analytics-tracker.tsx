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
      // Track page view in cookies
      trackPageView(pathname)

      // Track page view in Supabase
      trackPageViewInSupabase(pathname).catch(() => {
        // Silent error handling
      })
    }
  }, [pathname])

  return null // This component doesn't render anything
}
