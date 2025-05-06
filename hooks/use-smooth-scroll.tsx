"use client"

import { useEffect, useState, useCallback } from "react"
import { debounce } from "@/utils/smooth-scroll"

interface SmoothScrollOptions {
  enabled?: boolean
  duration?: number
  easing?: string
  offset?: number
}

export function useSmoothScroll(options: SmoothScrollOptions = {}) {
  const { enabled = true, duration = 1000, easing = "cubic-bezier(0.23, 1, 0.32, 1)", offset = 0 } = options

  const [isScrolling, setIsScrolling] = useState(false)

  // Handle smooth scrolling for anchor links
  const handleAnchorClick = useCallback(
    (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (!anchor) return

      // Check if it's an internal anchor link
      const href = anchor.getAttribute("href")
      if (!href || !href.startsWith("#")) return

      const targetId = href.substring(1)
      const targetElement = document.getElementById(targetId)

      if (!targetElement) return

      e.preventDefault()

      const targetPosition = targetElement.getBoundingClientRect().top + window.pageYOffset - offset

      setIsScrolling(true)

      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      })

      // Update URL without scrolling
      window.history.pushState(null, "", href)

      setTimeout(() => setIsScrolling(false), duration)
    },
    [offset, duration],
  )

  // Optimize scroll performance
  const optimizeScroll = useCallback(() => {
    const scrollHandler = debounce(() => {
      if (!isScrolling) {
        document.body.classList.add("is-scrolling")
        setIsScrolling(true)
      }

      setTimeout(() => {
        document.body.classList.remove("is-scrolling")
        setIsScrolling(false)
      }, 100)
    }, 10)

    window.addEventListener("scroll", scrollHandler, { passive: true })

    return () => {
      window.removeEventListener("scroll", scrollHandler)
    }
  }, [isScrolling])

  useEffect(() => {
    if (!enabled) return

    // Apply smooth scroll behavior to the document
    document.documentElement.style.scrollBehavior = "smooth"

    // Add click handler for anchor links
    document.addEventListener("click", handleAnchorClick)

    // Optimize scroll performance
    const cleanup = optimizeScroll()

    // Apply CSS variables for scroll animations
    document.documentElement.style.setProperty("--scroll-duration", `${duration}ms`)
    document.documentElement.style.setProperty("--scroll-easing", easing)

    return () => {
      document.documentElement.style.scrollBehavior = ""
      document.removeEventListener("click", handleAnchorClick)
      document.documentElement.style.removeProperty("--scroll-duration")
      document.documentElement.style.removeProperty("--scroll-easing")
      cleanup()
    }
  }, [enabled, duration, easing, handleAnchorClick, optimizeScroll])

  return { isScrolling }
}
