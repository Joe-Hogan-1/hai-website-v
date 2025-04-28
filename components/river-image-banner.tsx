"use client"

import { useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface RiverImageBannerProps {
  imageUrl: string
  title: string
  description: string
  linkUrl: string
  totalImages?: number
  imageIndex?: number
  position?: number
}

export default function RiverImageBanner({
  imageUrl,
  title,
  description,
  linkUrl,
  totalImages = 1,
  imageIndex = 0,
  position = 0,
}: RiverImageBannerProps) {
  const [imageError, setImageError] = useState<string | null>(null)
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  // Calculate deterministic positions based on image index
  // This ensures consistent positioning instead of random

  // Determine vertical position based on index (evenly distributed)
  const startPositionY = useRef(10 + (imageIndex % 3) * 25) // 10%, 35%, or 60% from top

  // Alternate flow direction based on even/odd index
  const flowDirection = useRef(position === 3 ? "left" : imageIndex % 2 === 0 ? "right" : "left")

  // Stagger flow durations slightly
  const flowDuration = useRef(30 + (imageIndex % 3) * 5) // 30s, 35s, or 40s

  // Stagger delays to prevent all images starting at once
  const flowDelay = useRef(imageIndex * 2) // 0s, 2s, 4s, etc.

  // Minimal vertical movement
  const verticalMovement = useRef(5)

  // No rotation
  const rotationAmount = useRef(0)

  // Increase the size of the blog windows - make them larger than the video banners
  // Changed from Math.max(30, 50 - totalImages * 10) to Math.max(40, 60 - totalImages * 10)
  const imageWidth = useRef(Math.max(40, 60 - totalImages * 10)) // 60% for 1 image, down to 40% for 3+ images

  // Handle image errors
  const handleImageError = () => {
    setImageError("Failed to load image")
  }

  return (
    <div
      ref={ref}
      className={`river-container transition-opacity duration-1000 ${inView ? "opacity-100" : "opacity-0"}`}
      style={{
        width: `${imageWidth.current}%`,
        top: `${startPositionY.current}%`,
        animation: `flow-${flowDirection.current} ${flowDuration.current}s linear infinite, 
                  vertical-drift ${flowDuration.current * 0.5}s ease-in-out infinite`,
        animationDelay: `${flowDelay.current}s, ${flowDelay.current}s`,
        zIndex: 20,
      }}
    >
      <div
        className="river-image-box"
        style={{
          transform: `rotate(${rotationAmount.current}deg)`,
        }}
      >
        <Link href={linkUrl} className="river-image-wrapper">
          {imageError ? (
            <div className="image-error-message">
              <p>{imageError}</p>
            </div>
          ) : (
            <img
              src={imageUrl || "/placeholder.svg?height=300&width=500"}
              alt={title}
              className="river-image"
              onError={handleImageError}
            />
          )}
        </Link>

        <div className="river-content">
          <h3 className="text-xl md:text-2xl font-semibold mb-1">{title}</h3>
          <p className="text-sm md:text-base mb-2">{description}</p>
          <Link
            href={linkUrl}
            className="text-white hover:text-[#ffd6c0] flex items-center text-sm font-semibold transition-colors"
          >
            Read more <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  )
}
