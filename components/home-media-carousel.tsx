"use client"

import { useState, useEffect, useRef } from "react"
import { useMediaQuery } from "@/hooks/use-media-query"
import Link from "next/link"

interface MediaItem {
  id: number
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  text_overlay: string | null
  text_position: string
  is_active: boolean
  display_order: number
  created_at: string
}

export default function HomeMediaCarousel() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [autoplayEnabled, setAutoplayEnabled] = useState(true)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  const isMobile = useMediaQuery("(max-width: 640px)") // Tailwind's 'sm' breakpoint
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)") // Tailwind's 'md' to 'lg'

  useEffect(() => {
    fetchMediaItems()
    pollIntervalRef.current = setInterval(fetchMediaItems, 120000) // Poll every 2 minutes
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current)
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  const fetchMediaItems = async () => {
    try {
      // setLoading(true); // Removed to prevent layout shift on poll
      const response = await fetch("/api/banner-media")
      if (!response.ok) throw new Error(`Failed to fetch banner media: ${response.status}`)
      const data = await response.json()
      setMediaItems(data && data.length > 0 ? data : [])
    } catch (error: any) {
      console.error("Error fetching media items:", error)
      setError(error.message || "An unexpected error occurred")
    } finally {
      setLoading(false)
    }
  }

  const goToNextSlide = () => {
    if (isTransitioning || mediaItems.length <= 1) return
    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length)
    setTimeout(() => setIsTransitioning(false), 500)
  }

  useEffect(() => {
    if (!autoplayEnabled || mediaItems.length <= 1 || isTransitioning) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
      return
    }
    timeoutRef.current = setTimeout(goToNextSlide, 5000)
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [currentIndex, isTransitioning, mediaItems.length, autoplayEnabled])

  if (loading && mediaItems.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff5f0]">
        <div className="text-[#ffd6c0] text-xl animate-pulse">Loading carousel...</div>
      </div>
    )
  }

  if (error && mediaItems.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff5f0]">
        <div className="text-red-500">{error}</div>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff5f0]">
        <div className="text-[#ffd6c0] text-xl">No media items available</div>
      </div>
    )
  }

  const getTextPositionClasses = (position: string) => {
    if (isMobile) {
      switch (position) {
        case "top-left":
        case "top-center":
        case "top-right":
          return "top-2 left-2 right-2 text-center"
        case "middle-left":
        case "middle-center":
        case "middle-right":
          return "top-1/2 -translate-y-1/2 left-2 right-2 text-center"
        default:
          return "bottom-2 left-2 right-2 text-center" // bottom positions
      }
    }
    if (isTablet) {
      switch (position) {
        case "top-left":
          return "top-4 left-4 text-left"
        case "top-center":
          return "top-4 left-1/2 -translate-x-1/2 text-center"
        case "top-right":
          return "top-4 right-4 text-right"
        case "middle-left":
          return "top-1/2 -translate-y-1/2 left-4 text-left"
        case "middle-center":
          return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
        case "middle-right":
          return "top-1/2 -translate-y-1/2 right-4 text-right"
        case "bottom-left":
          return "bottom-4 left-4 text-left"
        case "bottom-center":
          return "bottom-4 left-1/2 -translate-x-1/2 text-center"
        case "bottom-right":
          return "bottom-4 right-4 text-right"
        default:
          return "bottom-4 left-4 text-left"
      }
    }
    // Desktop
    switch (position) {
      case "top-left":
        return "top-6 left-6 text-left"
      case "top-center":
        return "top-6 left-1/2 -translate-x-1/2 text-center"
      case "top-right":
        return "top-6 right-6 text-right"
      case "middle-left":
        return "top-1/2 -translate-y-1/2 left-6 text-left"
      case "middle-center":
        return "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center"
      case "middle-right":
        return "top-1/2 -translate-y-1/2 right-6 text-right"
      case "bottom-left":
        return "bottom-6 left-6 text-left"
      case "bottom-center":
        return "bottom-6 left-1/2 -translate-x-1/2 text-center"
      case "bottom-right":
        return "bottom-6 right-6 text-right"
      default:
        return "bottom-6 left-6 text-left"
    }
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fff5f0]">
      <div className="relative bg-white overflow-hidden mx-2 sm:mx-4 my-2 sm:my-4">
        <div
          className="relative w-full"
          // Mobile: 1:1 aspect ratio (taller), Tablet+: 16:9 aspect ratio
          style={{ paddingBottom: isMobile ? "100%" : "40.25%" }}
        >
          {mediaItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Link href="/products" className="block w-full">
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="relative inset-0 w-full h-full object-contain" // object-contain to prevent cropping
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <div className="relative inset-0 flex items-center justify-center">
                    <img
                      src={item.media_url || "/placeholder.svg"}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain" // object-contain
                    />
                  </div>
                )}
                {item.text_overlay && (
                  <div
                    className={`absolute ${getTextPositionClasses(
                      item.text_position,
                    )} p-2 sm:p-4 text-white max-w-full sm:max-w-md`} // Ensure text overlay is responsive
                  >
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2">{item.text_overlay}</h2>
                    {item.description && (
                      <p className="text-sm md:text-base line-clamp-2 sm:line-clamp-none">{item.description}</p>
                    )}
                  </div>
                )}
              </Link>
            </div>
          ))}
          <div className="relative bottom-3 sm:bottom-6 right-6 sm:right-6 z-20 max-w-xs sm:max-w-sm md:max-w-md text-black">
            <div class="hbannerLink" className="p-2 sm:p-3 md:p-4 bg-white/90 sm:bg-white/70 md:bg-transparent backdrop-blur-sm sm:backdrop-blur-none">
              <h2 className="text-xl sm:text-xl md:text-2xl font-bold mb-2">embrace the glow.</h2>
              <p className="text-sm md:text-base mb-3 sm:mb-3">
                discover the intersection of wellness and a life well lived.
              </p>
              <Link
                href="/lifestyle"
                className="inline-block bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 sm:py-2 sm:px-4 transition-colors text-sm sm:text-base"
              >
                shop essentials.
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
