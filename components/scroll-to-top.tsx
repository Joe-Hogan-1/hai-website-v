"use client"

import { useEffect, useCallback } from "react"
import { usePathname } from "next/navigation"
import { scrollToPosition } from "@/utils/smooth-scroll"

export default function ScrollToTop() {
  const pathname = usePathname()

  const smoothScrollToTop = useCallback(() => {
    // Use smooth scroll utility instead of direct window.scrollTo
    scrollToPosition(0)
  }, [])

  useEffect(() => {
    smoothScrollToTop()
  }, [pathname, smoothScrollToTop])

  return null
}
