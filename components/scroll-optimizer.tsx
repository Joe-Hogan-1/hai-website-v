"use client"

import { useEffect } from "react"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"

export default function ScrollOptimizer() {
  // Initialize smooth scrolling
  useSmoothScroll()

  useEffect(() => {
    // Simple implementation that just adds will-change to key elements
    if (typeof document !== "undefined") {
      const animatedElements = document.querySelectorAll(
        ".scroll-animation, .fade-in-element, .stagger-reveal > *, .river-container",
      )

      animatedElements.forEach((el) => {
        if (el instanceof HTMLElement) {
          el.style.willChange = "transform, opacity"
        }
      })

      // Clean up will-change hints when component unmounts
      return () => {
        animatedElements.forEach((el) => {
          if (el instanceof HTMLElement) {
            el.style.willChange = "auto"
          }
        })
      }
    }
  }, [])

  return null
}
