"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase"

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
  const [debugInfo, setDebugInfo] = useState<string>("")

  useEffect(() => {
    fetchMediaItems()

    // Subscribe to changes in the banner_media table
    const channel = supabase
      .channel("banner_media_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "banner_media" }, (payload) => {
        console.log("Banner media change detected:", payload)
        fetchMediaItems()
      })
      .subscribe((status) => {
        console.log("Subscription status:", status)
        setDebugInfo((prev) => prev + `\nSubscription status: ${JSON.stringify(status)}`)
      })

    return () => {
      supabase.removeChannel(channel)
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)
      setDebugInfo((prev) => prev + `\nFetching media items...`)

      // Fetch from banner_media table
      const { data, error } = await supabase
        .from("banner_media")
        .select("*")
        .eq("is_active", true)
        .order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching media items:", error)
        setDebugInfo((prev) => prev + `\nError: ${error.message}`)
        setError(`Failed to load carousel items: ${error.message}`)
        return
      }

      console.log("Fetched media items:", data)
      setDebugInfo((prev) => prev + `\nFetched ${data?.length || 0} items`)

      if (data && data.length > 0) {
        setMediaItems(data)
      } else {
        setMediaItems([])
        setDebugInfo((prev) => prev + `\nNo items found`)
      }
    } catch (error: any) {
      console.error("Unexpected error fetching media items:", error)
      setDebugInfo((prev) => prev + `\nUnexpected error: ${error.message}`)
      setError("An unexpected error occurred")
      setMediaItems([])
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

  // Function to go to the previous slide
  const goToPrevSlide = () => {
    if (isTransitioning || mediaItems.length <= 1) return

    setIsTransitioning(true)
    setCurrentIndex((prevIndex) => (prevIndex - 1 + mediaItems.length) % mediaItems.length)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  // Toggle autoplay
  const toggleAutoplay = () => {
    setAutoplayEnabled(!autoplayEnabled)
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

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff5f0]">
        <div className="text-[#ffd6c0] text-xl animate-pulse">Loading carousel...</div>
      </div>
    )
  }

  if (error) {
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

  const currentItem = mediaItems[currentIndex]

  // Function to get text position classes
  const getTextPositionClasses = (position: string) => {
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
      <div className="absolute inset-4 bg-[#ffd6c0] rounded-sm overflow-hidden">
        {/* Media Items */}
        {mediaItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {item.media_type === "video" ? (
              <video src={item.media_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            ) : (
              <img src={item.media_url || "/placeholder.svg"} alt={item.title} className="w-full h-full object-cover" />
            )}

            {/* Text Overlay */}
            {item.text_overlay && (
              <div
                className={`absolute ${getTextPositionClasses(item.text_position)} p-4 bg-black/30 rounded text-white max-w-md`}
              >
                <h2 className="text-2xl font-bold mb-2">{item.text_overlay}</h2>
                {item.description && <p className="text-sm md:text-base">{item.description}</p>}
              </div>
            )}
          </div>
        ))}

        {/* Dots Indicator */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 z-20">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setIsTransitioning(true)
                  setCurrentIndex(index)
                  setTimeout(() => setIsTransitioning(false), 500)
                }}
                className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Autoplay Toggle */}
        <button
          onClick={toggleAutoplay}
          className="absolute top-4 right-4 bg-black/30 text-white p-2 rounded-full hover:bg-black/50 z-20 text-xs"
          aria-label={autoplayEnabled ? "Pause autoplay" : "Start autoplay"}
        >
          {autoplayEnabled ? "Pause" : "Play"}
        </button>
      </div>

      {/* Debug info - only visible in development */}
      {process.env.NODE_ENV === "development" && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-2 text-xs z-50 max-h-32 overflow-auto">
          <pre>{debugInfo}</pre>
        </div>
      )}
    </div>
  )
}
