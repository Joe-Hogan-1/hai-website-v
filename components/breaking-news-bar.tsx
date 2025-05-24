"use client"

import { useState, useEffect } from "react"
import { usePathname } from "next/navigation"
import { useBreakingNews } from "@/contexts/breaking-news-context"

export default function BreakingNewsBar() {
  const { newsText, isLoading } = useBreakingNews()
  const [show, setShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const checkIfShouldShow = () => {
      console.log("Breaking news check:", { pathname, newsText, newsTextLength: newsText?.length })

      // Don't show on these paths
      if (
        pathname.startsWith("/signin") ||
        pathname.startsWith("/dashboard") ||
        pathname === "/user-agreement" ||
        pathname === "/privacy-policy" ||
        pathname === "/age-verification" ||
        pathname === "/coming-soon"
      ) {
        console.log("Breaking news hidden due to pathname:", pathname)
        setShow(false)
        return
      }

      // Show if we have news text
      const shouldShow = !!newsText && newsText.length > 0
      console.log("Breaking news should show:", shouldShow)
      setShow(shouldShow)
    }

    checkIfShouldShow()
  }, [newsText, pathname])

  useEffect(() => {
    // Add class to body when breaking news is shown
    if (show) {
      document.body.classList.add("has-breaking-news")
    } else {
      document.body.classList.remove("has-breaking-news")
    }

    return () => {
      document.body.classList.remove("has-breaking-news")
    }
  }, [show])

  if (isLoading) {
    console.log("Breaking news is loading...")
    return null
  }

  if (!show) {
    console.log("Breaking news not showing:", { show, newsText })
    return null
  }

  console.log("Breaking news rendering:", newsText)

  return (
    <div
      className="breaking-news-bar bg-white text-black py-2 px-4 text-center font-medium sticky top-0 z-50"
      role="alert"
      aria-live="polite"
    >
      <div className="marquee-container">
        <div className="marquee">{newsText}</div>
      </div>
    </div>
  )
}
