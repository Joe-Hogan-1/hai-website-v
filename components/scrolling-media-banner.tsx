"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Image from "next/image"

interface Media {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  position: number
  created_at: string
}

interface ScrollingMediaBannerProps {
  position: number
}

export default function ScrollingMediaBanner({ position }: ScrollingMediaBannerProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)

  // Reference for video element
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchMedia() {
      try {
        // Try to fetch from banner_media table first
        const { data: mediaData, error: mediaError } = await supabase
          .from("banner_media")
          .select("*")
          .eq("position", position)
          .order("created_at", { ascending: false })

        // If banner_media table exists and has data
        if (!mediaError && mediaData && mediaData.length > 0) {
          setMediaItems(mediaData)
        } else {
          // Fall back to banner_videos table for backward compatibility
          const { data: videoData, error: videoError } = await supabase
            .from("banner_videos")
            .select("*")
            .eq("position", position)
            .order("created_at", { ascending: false })

          if (videoError) {
            setError(`Error fetching media: ${videoError.message}`)
            setMediaItems(getFallbackMedia())
          } else {
            // Convert video data to media format
            const convertedMedia =
              videoData?.map((video) => ({
                id: video.id,
                title: video.title,
                description: video.description,
                media_url: video.video_url,
                media_type: "video" as const,
                position: video.position,
                created_at: video.created_at,
              })) || []

            setMediaItems(convertedMedia.length > 0 ? convertedMedia : getFallbackMedia())
          }
        }
      } catch (error) {
        setError(`Unexpected error fetching media`)
        setMediaItems(getFallbackMedia())
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()

    // Subscribe to changes in the banner_media table for this position
    const mediaChannel = supabase
      .channel(`banner_media_${position}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_media",
          filter: `position=eq.${position}`,
        },
        (payload) => {
          fetchMedia()
        },
      )
      .subscribe()

    // Also subscribe to banner_videos for backward compatibility
    const videoChannel = supabase
      .channel(`banner_videos_${position}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_videos",
          filter: `position=eq.${position}`,
        },
        (payload) => {
          fetchMedia()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(mediaChannel)
      supabase.removeChannel(videoChannel)
    }
  }, [position])

  // Initialize video when it changes
  useEffect(() => {
    if (mediaItems.length > 0 && mediaItems[currentIndex].media_type === "video" && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch((err) => console.error("Error playing video:", err))
    }
  }, [mediaItems, currentIndex])

  // Function to go to the next media item
  const goToNextMedia = useCallback(() => {
    if (mediaItems.length <= 1) return
    const next = (currentIndex + 1) % mediaItems.length
    setCurrentIndex(next)
  }, [currentIndex, mediaItems.length])

  // Function to go to the previous media item
  const goToPrevMedia = useCallback(() => {
    if (mediaItems.length <= 1) return
    const prev = (currentIndex - 1 + mediaItems.length) % mediaItems.length
    setCurrentIndex(prev)
  }, [currentIndex, mediaItems.length])

  // Function to go to a specific media item
  const goToMedia = useCallback(
    (index: number) => {
      if (index === currentIndex) return
      setCurrentIndex(index)
    },
    [currentIndex],
  )

  // Auto-rotate media items
  useEffect(() => {
    if (mediaItems.length <= 1) return

    const rotationTimer = setInterval(() => {
      goToNextMedia()
    }, 5000) // Change media every 5 seconds

    return () => clearInterval(rotationTimer)
  }, [mediaItems.length, goToNextMedia])

  // Fallback media in case no items are found in the database
  function getFallbackMedia(): Media[] {
    return [
      {
        id: "fallback-1",
        title: "Welcome to hai.",
        description: "Discover our premium products for your wellness journey",
        media_url: "/videos/fallback-video.mp4",
        media_type: "video",
        position: 0,
        created_at: new Date().toISOString(),
      },
    ]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100/20 backdrop-blur-sm rounded-lg">
        <div className="text-white text-xl">Loading media...</div>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100/20 backdrop-blur-sm rounded-lg">
        <div className="text-white text-xl">No media available</div>
      </div>
    )
  }

  const currentMedia = mediaItems[currentIndex]
  const isVideo = currentMedia.media_type === "video"

  return (
    <div className="relative h-full w-full scrolling-media-banner">
      {/* Current Media */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden">
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentMedia.media_url}
            className="w-full h-full object-cover"
            autoPlay
            muted
            loop
            playsInline
          />
        ) : (
          <div className="w-full h-full relative">
            <Image
              src={currentMedia.media_url || "/placeholder.svg"}
              alt={currentMedia.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
            />
          </div>
        )}
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">{currentMedia.title}</h2>
          <p className="text-white/90 mb-4">{currentMedia.description}</p>
        </div>
      </div>

      {/* Navigation buttons - fixed positioning for better placement */}
      {mediaItems.length > 1 && (
        <>
          <button
            onClick={goToPrevMedia}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
            aria-label="Previous media"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={goToNextMedia}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-colors z-10"
            aria-label="Next media"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Media indicators */}
      {mediaItems.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-3 z-10">
          {mediaItems.map((_, index) => (
            <button
              key={index}
              onClick={() => goToMedia(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to media ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
