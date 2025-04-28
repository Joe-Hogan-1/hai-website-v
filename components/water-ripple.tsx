"use client"

import type React from "react"
import { useEffect, useRef } from "react"

const WaterRipple: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationFrameId: number
    let lastRippleTime = 0

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

      constructor(x: number, y: number) {
        this.x = x
        this.y = y
        this.radius = 0
        this.maxRadius = Math.random() * 80 + 20 // Random max radius between 20 and 100
        this.opacity = 0.7
        this.speed = Math.random() * 0.8 + 0.2 // Random speed between 0.2 and 1
      }

      draw() {
        if (!ctx) return
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2)
        ctx.strokeStyle = `rgba(255, 255, 255, ${this.opacity})`
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.closePath()
      }

      update() {
        if (this.radius < this.maxRadius) {
          this.radius += this.speed
          this.opacity = 0.7 * (1 - this.radius / this.maxRadius)
        } else {
          this.opacity = 0
        }
      }
    }

    const ripples: Ripple[] = []

    const animate = (currentTime: number) => {
      // Don't run animation if component is not visible
      if (!canvas || !ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Create new ripples less frequently - reduce from 0.3 to 0.15 probability
      if (currentTime - lastRippleTime > 3000 && Math.random() < 0.15) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        ripples.push(new Ripple(x, y))
        lastRippleTime = currentTime
      }

      // Limit the maximum number of ripples to prevent performance issues
      if (ripples.length > 10) {
        ripples.splice(0, ripples.length - 10)
      }

      for (let i = 0; i < ripples.length; i++) {
        ripples[i].draw()
        ripples[i].update()

        if (ripples[i].opacity <= 0) {
          ripples.splice(i, 1)
          i--
        }
      }

      animationFrameId = requestAnimationFrame(animate)
    }

    animate(0)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener("resize", resizeCanvas)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full z-[-1]" />
}

export default WaterRipple
