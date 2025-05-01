"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase"

interface MediaItem {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  created_at: string
}

export default function HomeMediaCarousel() {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    fetchMediaItems()

    // Subscribe to changes in the banner_media table
    const channel = supabase
      .channel("banner_media_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "banner_media" }, () => {
        fetchMediaItems()
      })
      .subscribe()

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

      // Try to fetch from banner_media table
      const { data, error } = await supabase.from("banner_media").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching media items:", error)

        // If the table doesn't exist, try to fetch from banner_videos as fallback
        if (error.message.includes("does not exist")) {
          const { data: videoData, error: videoError } = await supabase
            .from("banner_videos")
            .select("*")
            .order("created_at", { ascending: false })

          if (videoError) {
            setError("Failed to load carousel items")
            setMediaItems(getFallbackItems())
          } else {
            // Convert video data to media format
            const convertedItems =
              videoData?.map((video) => ({
                id: video.id,
                title: video.title,
                description: video.description,
                media_url: video.video_url,
                media_type: "video" as const,
                created_at: video.created_at,
              })) || []

            setMediaItems(convertedItems.length > 0 ? convertedItems : getFallbackItems())
          }
        } else {
          setError("Failed to load carousel items")
          setMediaItems(getFallbackItems())
        }
      } else {
        setMediaItems(data && data.length > 0 ? data : getFallbackItems())
      }
    } catch (error) {
      console.error("Unexpected error fetching media items:", error)
      setError("An unexpected error occurred")
      setMediaItems(getFallbackItems())
    } finally {
      setLoading(false)
    }
  }

  // Fallback items if no media items are found
  const getFallbackItems = (): MediaItem[] => {
    return [
      {
        id: "fallback-1",
        title: "Welcome to hai.",
        description: "Discover our premium products for your wellness journey",
        media_url: "/placeholder.svg?height=800&width=1200",
        media_type: "image",
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-2",
        title: "Premium Products",
        description: "Explore our selection of high-quality products",
        media_url: "/placeholder.svg?height=800&width=1200",
        media_type: "image",
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-3",
        title: "Join Our Community",
        description: "Connect with like-minded individuals",
        media_url: "/placeholder.svg?height=800&width=1200",
        media_type: "image",
        created_at: new Date().toISOString(),
      },
    ]
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

  // Set up automatic slide rotation
  useEffect(() => {
    if (mediaItems.length <= 1) return

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
  }, [currentIndex, isTransitioning, mediaItems.length])

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#fff5f0]">
        <div className="text-[#ffd6c0] text-xl animate-pulse">Loading...</div>
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

            {/* Content Overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 text-white">
              <h2 className="text-2xl font-bold mb-2">{item.title}</h2>
              <p className="text-sm md:text-base">{item.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
