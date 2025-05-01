"use client"

import type React from "react"
import { useEffect, useRef, useState } from "react"

const WaterRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isVisible, setIsVisible] = useState(true)
  const animationFrameIdRef = useRef<number>()
  const ripplesRef = useRef<Ripple[]>([])
  const lastRippleTimeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)

    class Ripple {
      x: number
      y: number
      radius: number
      maxRadius: number
      opacity: number
      speed: number
      color: string

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = Math.random() * 80 + 20 // Random max radius between 20 and 100
        this.opacity = 0.7
        this.speed = Math.random() * 0.8 + 0.2 // Random speed between 0.2 and 1

        // Add subtle color variation
        const hue = Math.random() * 20 + 200 // Blue-ish hue
        const saturation = Math.random() * 20 + 70 // High saturation
        const lightness = Math.random() * 20 + 70 // High lightness
        this.color = `hsla(${hue}, ${saturation}%, ${lightness}%, ${this.opacity})`
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = this.color
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.closePath()
      }

      update() {
        if (this.radius < this.maxRadius) {
          this.radius += this.speed
          this.opacity = 0.7 * (1 - this.radius / this.maxRadius)
          this.color = this.color.replace(/[\d.]+\)$/, `${this.opacity})`)
        } else {
          this.opacity = 0
        }
      }
    }

    // Use IntersectionObserver to only animate when visible
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting)
        })
      },
      { threshold: 0.1 },
    )

    if (canvas) {
      observer.observe(canvas)
    }

    const animate = (currentTime: number) => {
      if (!isVisible || !canvas || !ctx) {
        animationFrameIdRef.current = requestAnimationFrame(animate)
        return
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create new ripples less frequently
      if (currentTime - lastRippleTimeRef.current > 3000 && Math.random() < 0.15) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ripplesRef.current.push(new Ripple(x, y))
        lastRippleTimeRef.current = currentTime
      }

      // Limit the maximum number of ripples
      if (ripplesRef.current.length > 10) {
        ripplesRef.current.splice(0, ripplesRef.current.length - 10)
      }

      for (let i = 0; i < ripplesRef.current.length; i++) {
        ripplesRef.current[i].draw()
        ripplesRef.current[i].update()

        if (ripplesRef.current[i].opacity <= 0) {
          ripplesRef.current.splice(i, 1)
          i--
        }
      }

      animationFrameIdRef.current = requestAnimationFrame(animate)
    }

    animationFrameIdRef.current = requestAnimationFrame(animate)

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current)
      }
      window.removeEventListener("resize", resizeCanvas)
      observer.disconnect()
    }
  }, [isVisible])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1]" />
}

export default WaterRipple
