"use client"

import { useEffect } from "react"

export function useSmoothScroll() {
  useEffect(() => {
    // Simple implementation that just sets smooth scrolling on the document
    if (typeof document !== "undefined") {
      document.documentElement.style.scrollBehavior = "smooth"
    }

    return () => {
      if (typeof document !== "undefined") {
        document.documentElement.style.scrollBehavior = ""
      }
    }
  }, [])

  return null
}
