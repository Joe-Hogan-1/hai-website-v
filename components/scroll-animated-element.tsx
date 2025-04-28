"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

interface ScrollAnimatedElementProps {
  children: ReactNode
  className?: string
  threshold?: number
  delay?: number
}

export default function ScrollAnimatedElement({
  children,
  className = "",
  threshold = 0.2,
  delay = 0,
}: ScrollAnimatedElementProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            setIsVisible(true)
          }, delay)
          observer.unobserve(entry.target)
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -100px 0px",
      },
    )

    if (elementRef.current) {
      observer.observe(elementRef.current)
    }

    return () => {
      if (elementRef.current) {
        observer.unobserve(elementRef.current)
      }
    }
  }, [threshold, delay])

  return (
    <div ref={elementRef} className={`scroll-animation ${isVisible ? "animate" : ""} ${className}`}>
      {children}
    </div>
  )
}
