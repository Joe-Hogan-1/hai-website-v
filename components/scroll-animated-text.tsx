"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"

interface ScrollAnimatedTextProps {
  text: string
  tag?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p"
  className?: string
  threshold?: number
  delay?: number
}

export default function ScrollAnimatedText({
  text,
  tag = "h2",
  className = "",
  threshold = 0.2,
  delay = 0,
}: ScrollAnimatedTextProps) {
  const elementRef = useRef<HTMLElement>(null)
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

  const letters = text.split("")

  const Tag = tag

  return (
    <Tag ref={elementRef} className={`scroll-animation-title ${isVisible ? "animate" : ""} ${className}`}>
      {letters.map((letter, index) => (
        <span key={index} className="letter" style={{ "--index": index } as React.CSSProperties}>
          {letter === " " ? "\u00A0" : letter}
        </span>
      ))}
    </Tag>
  )
}
