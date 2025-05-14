"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import { useMediaQuery } from "@/hooks/use-media-query"

interface LifestyleBanner {
  id: string
  title?: string
  description?: string
  image_url: string
  alt_text?: string
}

export default function LifestyleBanner() {
  const [banners, setBanners] = useState<LifestyleBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const [touchStart, setTouchStart] = useState(0)

  // Use media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Fetch banners from Supabase
  useEffect(() => {
    async function fetchBanners() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("lifestyle_banner")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching lifestyle banners:", error)
          setBanners([])
        } else {
          setBanners(data || [])
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Auto-rotate banners
  useEffect(() => {
    if (banners.length <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 5000) // Change banner every 5 seconds

    return () => clearInterval(interval)
  }, [banners.length, isPaused])

  // Resume auto-rotation after 10 seconds of inactivity
  useEffect(() => {
    if (!isPaused) return

    const timeout = setTimeout(() => {
      setIsPaused(false)
    }, 10000) // Resume after 10 seconds

    return () => clearTimeout(timeout)
  }, [isPaused])

  const goToPrevious = useCallback(() => {
    setIsPaused(true)
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? banners.length - 1 : prevIndex - 1))
  }, [banners.length])

  const goToNext = useCallback(() => {
    setIsPaused(true)
    setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
  }, [banners.length])

  const goToSlide = useCallback((index: number) => {
    setIsPaused(true)
    setCurrentIndex(index)
  }, [])

  // Touch event handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX)
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEnd = e.changedTouches[0].clientX
    const diff = touchStart - touchEnd

    // If the swipe is significant enough (more than 50px)
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        // Swipe left, go to next
        goToNext()
      } else {
        // Swipe right, go to previous
        goToPrevious()
      }
    }
  }

  // If no banners or still loading, show placeholder
  if (loading) {
    return (
      <div className="w-full h-[375px] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-400">Loading banner...</p>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[375px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No banner available</p>
      </div>
    )
  }

  // If only one banner, show it without carousel controls
  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="relative w-full h-[375px] overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <img
            src={banner.image_url || "/placeholder.svg"}
            alt={banner.alt_text || "Lifestyle Banner"}
            className={`w-full h-full ${isMobile ? "object-contain" : isTablet ? "object-cover object-center" : "object-cover"}`}
          />
        </div>
        {/* Shadow overlay removed */}
        {(banner.title || banner.description) && (
          <div className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-4" : isTablet ? "p-6" : "p-8"} text-white`}>
            {banner.title && (
              <h2
                className={`${isMobile ? "text-xl" : isTablet ? "text-2xl" : "text-3xl"} font-bold mb-${isMobile ? "1" : "2"} text-shadow-sm text-left`}
              >
                {banner.title}
              </h2>
            )}
            {banner.description && (
              <p
                className={`${isMobile ? "text-sm line-clamp-2" : isTablet ? "text-base line-clamp-3" : "text-lg"} max-w-3xl text-shadow-sm text-left`}
              >
                {banner.description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Multiple banners, show carousel without indicator dots
  return (
    <div
      className="relative w-full h-[375px] overflow-hidden rounded-lg"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Banner images */}
      <div className="h-full">
        {banners.map((banner, index) => (
          <div
            key={banner.id}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
            }`}
          >
            <img
              src={banner.image_url || "/placeholder.svg"}
              alt={banner.alt_text || "Lifestyle Banner"}
              className={`w-full h-full ${isMobile ? "object-contain" : isTablet ? "object-cover object-center" : "object-cover"}`}
            />
            {/* Shadow overlay removed */}
            {(banner.title || banner.description) && (
              <div
                className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-4" : isTablet ? "p-6" : "p-8"} text-white`}
              >
                {banner.title && (
                  <h2
                    className={`${isMobile ? "text-xl" : isTablet ? "text-2xl" : "text-3xl"} font-bold mb-${isMobile ? "1" : "2"} text-shadow-sm text-left`}
                  >
                    {banner.title}
                  </h2>
                )}
                {banner.description && (
                  <p
                    className={`${isMobile ? "text-sm line-clamp-2" : isTablet ? "text-base line-clamp-3" : "text-lg"} max-w-3xl text-shadow-sm text-left`}
                  >
                    {banner.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
