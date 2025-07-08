"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MediaItem {
  id: string
  media_url: string
  title?: string
  description?: string
  media_type: "image" | "video"
  created_at: string
  text_overlay?: string
}

export default function HomeMediaCarousel() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    fetchMediaItems()
    const intervalId = setInterval(fetchMediaItems, 300000)
    return () => clearInterval(intervalId)
  }, [])

  useEffect(() => {
    if (mediaItems.length > 1) {
      const timer = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length)
      }, 5000)
      return () => clearInterval(timer)
    }
  }, [mediaItems.length])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/banner-media")
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const items = data || []
      if (items.length === 0) {
        setMediaItems(getDefaultMediaItems())
      } else {
        setMediaItems(items)
      }
    } catch (err) {
      console.error("Error fetching media items:", err)
      setMediaItems(getDefaultMediaItems())
    } finally {
      setLoading(false)
    }
  }

  const getDefaultMediaItems = (): MediaItem[] => [
    {
      id: "default-1",
      media_url: "/placeholder.svg?height=600&width=1200",
      title: "Welcome to HAI",
      description: "Premium cannabis products",
      media_type: "image",
      created_at: new Date().toISOString(),
    },
    {
      id: "default-2",
      media_url: "/placeholder.svg?height=600&width=1200",
      title: "Quality Products",
      description: "Discover our collection",
      media_type: "image",
      created_at: new Date().toISOString(),
    },
  ]

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length)
  }

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % mediaItems.length)
  }

  if (loading) {
    return (
      <div className="relative w-full">
        <div className="w-full h-64 md:h-96 bg-gray-300 animate-pulse" />
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      <div className="relative w-full overflow-hidden">
        {mediaItems.map((item, index) => (
          <div key={item.id} className={`w-full ${index === currentIndex ? "block" : "hidden"}`}>
            {item.media_type === "video" ? (
              <video src={item.media_url} className="w-full h-auto object-contain" autoPlay muted loop playsInline />
            ) : (
              <img
                src={item.media_url || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-auto object-contain"
              />
            )}

            {/* Text Overlay */}
            {(item.text_overlay || item.description) && (
              <div className="absolute bottom-4 left-4 md:bottom-8 md:left-8 z-10">
                {item.text_overlay && (
                  <h2 className="text-white text-2xl md:text-4xl font-bold mb-2 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                    {item.text_overlay}
                  </h2>
                )}
                {item.description && (
                  <p className="text-white text-lg md:text-xl drop-shadow-[0_1px_3px_rgba(0,0,0,0.7)]">
                    {item.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Navigation Arrows */}
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
            aria-label="Previous image"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNext}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all z-10"
            aria-label="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Dots Indicator */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/75"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
