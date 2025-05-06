"use client"

import { useEffect } from "react"
import { useSmoothScroll } from "@/hooks/use-smooth-scroll"
import { initScrollOptimizer } from "@/utils/smooth-scroll"

export default function ScrollOptimizer() {
  // Initialize smooth scrolling
  useSmoothScroll({
    enabled: true,
    duration: 800,
    easing: "cubic-bezier(0.23, 1, 0.32, 1)",
    offset: 80, // Offset for header height
  })

  useEffect(() => {
    // Initialize scroll performance optimizer
    initScrollOptimizer()

    // Add will-change hints for elements that animate during scroll
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
  }, [])

  return null
}
