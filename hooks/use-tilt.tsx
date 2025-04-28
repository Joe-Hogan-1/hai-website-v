"use client"

import type React from "react"

import { useRef, useCallback } from "react"

interface TiltOptions {
  max: number
  scale: number
  speed: number
}

export function useTilt(options: Partial<TiltOptions> = {}) {
  const {
    max = 15, // max tilt rotation (degrees)
    scale = 1.05, // scale on hover
    speed = 400, // speed of the transition
  } = options

  // Reference to the element we'll be tilting
  const tiltRef = useRef<HTMLDivElement>(null)

  // Track if we're currently hovering the element
  const isHovering = useRef(false)

  // Handle mouse movement over the element
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!tiltRef.current || !isHovering.current) return

      const element = tiltRef.current
      const { left, top, width, height } = element.getBoundingClientRect()

      const x = e.clientX - left
      const y = e.clientY - top

      // Calculate rotation based on mouse position
      const xRotation = (max * (y - height / 2)) / (height / 2)
      const yRotation = (-max * (x - width / 2)) / (width / 2)

      // Apply the transformation
      element.style.transform = `
        perspective(1000px)
        scale(${scale})
        rotateX(${xRotation}deg)
        rotateY(${yRotation}deg)
        translateY(-20px)
      `
    },
    [max, scale],
  )

  // Handle mouse enter
  const handleMouseEnter = useCallback(() => {
    if (!tiltRef.current) return

    isHovering.current = true

    const element = tiltRef.current
    element.style.transition = `transform ${speed}ms cubic-bezier(.03,.98,.52,.99)`
    element.style.transform = `
      perspective(1000px)
      scale(${scale})
      translateY(-20px)
    `
  }, [scale, speed])

  // Handle mouse leave
  const handleMouseLeave = useCallback(() => {
    if (!tiltRef.current) return

    isHovering.current = false

    const element = tiltRef.current
    element.style.transition = `transform ${speed}ms cubic-bezier(.03,.98,.52,.99)`
    element.style.transform = `
      perspective(1000px)
      scale(1)
      rotateX(0deg)
      rotateY(0deg)
      translateY(0)
    `
  }, [speed])

  return { tiltRef, handleMouseMove, handleMouseEnter, handleMouseLeave }
}
