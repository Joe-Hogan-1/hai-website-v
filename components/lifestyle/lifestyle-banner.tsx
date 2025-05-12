"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import { ChevronLeft, ChevronRight } from "lucide-react"
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
      <div className="w-full h-[750px] bg-gray-100 animate-pulse flex items-center justify-center">
        <p className="text-gray-400">Loading banner...</p>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="w-full h-[750px] bg-gray-100 flex items-center justify-center">
        <p className="text-gray-400">No banner available</p>
      </div>
    )
  }

  // If only one banner, show it without carousel controls
  if (banners.length === 1) {
    const banner = banners[0]
    return (
      <div className="relative w-full h-[750px] overflow-hidden rounded-lg">
        <div className="absolute inset-0">
          <img
            src={banner.image_url || "/placeholder.svg"}
            alt={banner.alt_text || "Lifestyle Banner"}
            className={`w-full h-full ${isMobile ? "object-contain" : "object-cover"}`}
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        {(banner.title || banner.description) && (
          <div
            className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-6" : isTablet ? "p-8" : "p-10"} text-white`}
          >
            {banner.title && (
              <h2
                className={`${isMobile ? "text-2xl" : isTablet ? "text-3xl" : "text-4xl"} font-bold mb-${isMobile ? "2" : "3"}`}
              >
                {banner.title}
              </h2>
            )}
            {banner.description && (
              <p className={`${isMobile ? "text-base line-clamp-3" : isTablet ? "text-lg" : "text-xl"} max-w-3xl`}>
                {banner.description}
              </p>
            )}
          </div>
        )}
      </div>
    )
  }

  // Multiple banners, show carousel
  return (
    <div
      className="relative w-full h-[750px] overflow-hidden rounded-lg"
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
              className={`w-full h-full ${isMobile ? "object-contain" : "object-cover"}`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            {(banner.title || banner.description) && (
              <div
                className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-6" : isTablet ? "p-8" : "p-10"} text-white`}
              >
                {banner.title && (
                  <h2
                    className={`${isMobile ? "text-2xl" : isTablet ? "text-3xl" : "text-4xl"} font-bold mb-${isMobile ? "2" : "3"}`}
                  >
                    {banner.title}
                  </h2>
                )}
                {banner.description && (
                  <p className={`${isMobile ? "text-base line-clamp-3" : isTablet ? "text-lg" : "text-xl"} max-w-3xl`}>
                    {banner.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation arrows */}
      <button
        onClick={goToPrevious}
        className={`absolute ${isMobile ? "left-4" : "left-8"} top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white ${
          isMobile ? "p-2" : isTablet ? "p-3" : "p-4"
        } rounded-full focus:outline-none transition-colors`}
        aria-label="Previous banner"
      >
        <ChevronLeft size={isMobile ? 24 : 32} />
      </button>
      <button
        onClick={goToNext}
        className={`absolute ${isMobile ? "right-4" : "right-8"} top-1/2 transform -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white ${
          isMobile ? "p-2" : isTablet ? "p-3" : "p-4"
        } rounded-full focus:outline-none transition-colors`}
        aria-label="Next banner"
      >
        <ChevronRight size={isMobile ? 24 : 32} />
      </button>

      {/* Indicator dots */}
      <div
        className={`absolute ${isMobile ? "bottom-6" : isTablet ? "bottom-8" : "bottom-10"} left-1/2 transform -translate-x-1/2 flex ${isMobile ? "space-x-2" : "space-x-4"}`}
      >
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`${isMobile ? "w-3 h-3" : "w-4 h-4"} rounded-full focus:outline-none transition-colors ${
              index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
            }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
