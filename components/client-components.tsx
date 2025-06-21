"use client"

import { usePathname } from "next/navigation"
import Header from "./header"
import BreakingNewsBar from "./breaking-news-bar"
import CookieConsent from "./cookie-consent"
import NewsletterPopup from "./newsletter-popup"
import AnalyticsTracker from "./analytics-tracker"

export default function ClientComponents() {
  const pathname = usePathname()
  const noHeaderPaths = ["/signin", "/age-verification"]
  const noNewsletterPaths = ["/signin", "/age-verification", "/dashboard"]
  const showHeader = !(noHeaderPaths.includes(pathname) || pathname.startsWith("/dashboard"))
  const showNewsletter = !noNewsletterPaths.some((path) => pathname === path || pathname.startsWith(path))

  return (
    <>
      <AnalyticsTracker />
      <BreakingNewsBar />
      {showHeader && <Header />}
      <CookieConsent />
      {showNewsletter && <NewsletterPopup />}
    </>
  )
}
