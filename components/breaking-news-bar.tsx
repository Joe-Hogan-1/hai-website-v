"use client"

import { useState, useEffect } from "react"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { usePathname } from "next/navigation"
import { useSiteSettings } from "@/utils/site-settings"

export default function BreakingNewsBar() {
  const { newsText, isLoading } = useBreakingNews()
  const [shouldShow, setShouldShow] = useState(false)
  const pathname = usePathname()
  const { isComingSoon } = useSiteSettings()

  useEffect(() => {
    // Check if we should show the breaking news bar
    const checkIfShouldShow = () => {
      // Don't show if coming soon mode is active
      if (isComingSoon) {
        setShouldShow(false)
        return
      }

      // Don't show on these specific pages
      if (pathname === "/user-agreement" || pathname === "/privacy-policy" || pathname === "/age-verification") {
        setShouldShow(false)
        return
      }

      // On homepage, only show if age verified
      if (pathname === "/") {
        const isAgeVerified = sessionStorage.getItem("ageVerified") === "true"
        setShouldShow(isAgeVerified)
        return
      }

      // Show on all other pages
      setShouldShow(true)
    }

    checkIfShouldShow()

    // Listen for storage events (in case age verification happens in another tab)
    const handleStorageChange = () => {
      checkIfShouldShow()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [pathname, isComingSoon])

  // Don't render anything if loading, no news text, or shouldn't show
  if (isLoading || !newsText || !shouldShow) {
    return null
  }

  return (
    <div
      className="bg-white h-[32px] w-full overflow-hidden fixed top-0 left-0 right-0 z-[60] shadow-md breaking-news-bar animate-fadeIn flex items-center"
      style={{ margin: 0, padding: 0, borderBottom: "1px solid rgba(0,0,0,0.1)" }}
    >
      <div className="marquee-container">
        <div className="marquee text-black">
          <span>{newsText}</span>
        </div>
      </div>
    </div>
  )
}
