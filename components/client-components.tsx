"use client"

import dynamic from "next/dynamic"
import { useEffect } from "react"

// Dynamically import components that don't need to be server-rendered
const BreakingNewsBar = dynamic(() => import("@/components/breaking-news-bar"), { ssr: false })
const CookieConsent = dynamic(() => import("@/components/cookie-consent"), { ssr: false })
const AnalyticsTracker = dynamic(() => import("@/components/analytics-tracker"), { ssr: false })
const InteractionTracker = dynamic(() => import("@/components/analytics/interaction-tracker"), { ssr: false })

export default function ClientComponents() {
  useEffect(() => {
    // Simple initialization without complex functions
    if (typeof document !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth"
    }

    // Add class to body when breaking news is present
    const hasBreakingNews = document.querySelector(".breaking-news-bar") !== null
    if (hasBreakingNews) {
      document.body.classList.add("has-breaking-news")
    }

    return () => {
      // Cleanup
      document.body.classList.remove("has-breaking-news")
    }
  }, [])

  return (
    <>
      <BreakingNewsBar />
      <CookieConsent />
      <AnalyticsTracker />
      <InteractionTracker />
    </>
  )
}
