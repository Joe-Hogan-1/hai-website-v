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

  // Add media query hooks for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  useEffect(() => {
    // Initial fetch
    fetchMediaItems()

    // Set up polling for updates every 2 minutes
    pollIntervalRef.current = setInterval(() => {
      fetchMediaItems()
    }, 120000) // 2 minutes

    return () => {
      // Clean up intervals on unmount
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current)
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)

      // Use fetch API instead of direct Supabase client
      const response = await fetch("/api/banner-media")

      if (!response.ok) {
        throw new Error(`Failed to fetch banner media: ${response.status}`)
      }

      const data = await response.json()

      if (data && data.length > 0) {
        setMediaItems(data)
      } else {
        setMediaItems([])
      }
    } catch (error: any) {
      console.error("Error fetching media items:", error)
      setError(error.message || "An unexpected error occurred")
      // Don't clear existing items on error to prevent flickering
    } finally {
      setLoading(false)
    }
  }

  // Function to go to the next slide
  const goToNextSlide = () => {
    if (isTransitioning || mediaItems.length <= 1) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  // Set up automatic slide rotation
  useEffect(() => {
    if (!autoplayEnabled || mediaItems.length <= 1) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up new timeout for next slide
    timeoutRef.current = setTimeout(() => {
      goToNextSlide()
    }, 5000) // Change slide every 5 seconds

    // Cleanup on unmount or when currentIndex changes
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
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

  // Function to get text position classes
  const getTextPositionClasses = (position: string) => {
    // Adjust text positioning for mobile
    if (isMobile) {
      // On mobile, we want to ensure text is more readable and positioned better
      switch (position) {
        case "top-left":
        case "top-center":
        case "top-right":
          return "top-2 left-2 right-2 text-center"
        case "middle-left":
        case "middle-center":
        case "middle-right":
          return "top-1/2 -translate-y-1/2 left-2 right-2 text-center"
        case "bottom-left":
        case "bottom-center":
        case "bottom-right":
          return "bottom-2 left-2 right-2 text-center"
        default:
          return "bottom-2 left-2 right-2 text-center"
      }
    }

    // Tablet adjustments
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

    // Desktop positioning (original)
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
      {/* Changed from bg-[#ffd6c0] to bg-white for white borders */}
      <div className="relative bg-white rounded-sm overflow-hidden m-4">
        {/* Added aspect ratio container */}
        <div className="relative w-full" style={{ paddingBottom: "56.25%" /* 16:9 aspect ratio */ }}>
          {/* Media Items */}
          {mediaItems.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              {/* Wrap in Link component to make clickable */}
              <Link href="/products" className="block w-full h-full">
                {item.media_type === "video" ? (
                  <video
                    src={item.media_url}
                    className="absolute inset-0 w-full h-full object-contain"
                    autoPlay
                    muted
                    loop
                    playsInline
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <img
                      src={item.media_url || "/placeholder.svg"}
                      alt={item.title}
                      className="max-w-full max-h-full object-contain"
                      style={{
                        width: "auto",
                        height: "auto",
                        maxWidth: "100%",
                        maxHeight: "100%",
                      }}
                    />
                  </div>
                )}

                {/* Text Overlay with responsive adjustments */}
                {item.text_overlay && (
                  <div
                    className={`absolute ${getTextPositionClasses(
                      item.text_position,
                    )} p-2 sm:p-4 text-white max-w-full sm:max-w-md`}
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

          {/* Fixed text and button in lower left corner - appears on all slides */}
          <div className="absolute bottom-6 left-6 z-20 max-w-xs sm:max-w-sm md:max-w-md text-black">
            <div className="p-3 sm:p-4">
              <h2 className="text-lg sm:text-xl md:text-2xl font-bold mb-1">embrace the glow.</h2>
              <p className="text-sm md:text-base mb-3">discover the intersection of wellness and a life well lived.</p>
              <Link
                href="/products"
                className="inline-block bg-black hover:bg-gray-800 text-white font-medium py-2 px-4 rounded transition-colors"
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
