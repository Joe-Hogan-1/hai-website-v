"use client"

import dynamic from "next/dynamic"

// Dynamically import components that don't need to be server-rendered
const BreakingNewsBar = dynamic(() => import("@/components/breaking-news-bar"), { ssr: false })
const CookieConsent = dynamic(() => import("@/components/cookie-consent"), { ssr: false })
const AnalyticsTracker = dynamic(() => import("@/components/analytics-tracker"), { ssr: false })

export default function ClientComponents() {
  return (
    <>
      <BreakingNewsBar />
      <CookieConsent />
      <AnalyticsTracker />
    </>
  )
}
