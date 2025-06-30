"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"

interface Media {
  id: string
  media_url: string
  media_type: "video" | "image"
  created_at: string
  text_overlay?: {
    content: string
    position: { x: number; y: number }
    style?: {
      fontSize: string
      color: string
      fontWeight: string
    }
  }
}

export default function ScrollingMediaBanner() {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [visibleItems, setVisibleItems] = useState<boolean[]>([])
  const itemRefs = useRef<(HTMLDivElement | null)[]>([])
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function fetchMedia() {
      try {
        // Try to fetch from banner_media table first
        const { data: mediaData, error: mediaError } = await supabase
          .from("banner_media")
          .select("*")
          .order("created_at", { ascending: false })

        // If banner_media table exists and has data
        if (!mediaError && mediaData && mediaData.length > 0) {
          setMediaItems(mediaData)
        } else {
          // Fall back to banner_videos table for backward compatibility
          const { data: videoData, error: videoError } = await supabase
            .from("banner_videos")
            .select("*")
            .order("created_at", { ascending: false })

          if (videoError) {
            setError(`Error fetching media: ${videoError.message}`)
            setMediaItems(getFallbackMedia())
          } else {
            // Convert video data to media format
            const convertedMedia =
              videoData?.map((video) => ({
                id: video.id,
                media_url: video.video_url,
                media_type: "video" as const,
                created_at: video.created_at,
                text_overlay: video.text_overlay,
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

    // Subscribe to changes in the banner_media table
    const mediaChannel = supabase
      .channel(`banner_media_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_media",
        },
        () => {
          fetchMedia()
        },
      )
      .subscribe()

    // Also subscribe to banner_videos for backward compatibility
    const videoChannel = supabase
      .channel(`banner_videos_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_videos",
        },
        () => {
          fetchMedia()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(mediaChannel)
      supabase.removeChannel(videoChannel)
    }
  }, [])

  // Fallback media in case no items are found in the database
  function getFallbackMedia(): Media[] {
    return [
      {
        id: "fallback-1",
        media_url: "/videos/fallback-video.mp4",
        media_type: "video",
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-2",
        media_url: "/placeholder.svg?height=400&width=600",
        media_type: "image",
        created_at: new Date().toISOString(),
      },
      {
        id: "fallback-3",
        media_url: "/videos/fallback-video.mp4",
        media_type: "video",
        created_at: new Date().toISOString(),
      },
    ]
  }

  // Set up intersection observer for animation
  useEffect(() => {
    // Initialize visibility state for each item
    setVisibleItems(new Array(mediaItems.length).fill(false))

    // Set up refs array
    itemRefs.current = itemRefs.current.slice(0, mediaItems.length)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const index = itemRefs.current.findIndex((ref) => ref === entry.target)
          if (index !== -1) {
            setVisibleItems((prev) => {
              const newState = [...prev]
              newState[index] = entry.isIntersecting
              return newState
            })
          }
        })
      },
      { threshold: 0.1 },
    )

    // Observe all item refs
    itemRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref)
    })

    return () => {
      itemRefs.current.forEach((ref) => {
        if (ref) observer.unobserve(ref)
      })
    }
  }, [mediaItems])

  const handleEditClick = () => {
    router.push("/dashboard?tab=media-text")
  }

  if (loading) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-black text-xl">Loading media...</div>
      </div>
    )
  }

  if (mediaItems.length === 0) {
    return (
      <div className="relative h-full w-full flex items-center justify-center">
        <div className="text-black text-xl">No media available</div>
      </div>
    )
  }

  // Limit to 5 items to prevent overcrowding
  const displayItems = mediaItems.slice(0, 5)

  return (
    <div
      className="relative h-full w-1/2 overflow-visible"
      style={{
        borderRight: "1px solid rgba(0, 0, 0, 0.1)",
        boxShadow: "none", // Remove the box shadow here too
      }}
    >
      {/* Staircase Media Cards */}
      <div className="absolute inset-0 z-0">
        {displayItems.map((media, index) => (
          <div
            ref={(el) => (itemRefs.current[index] = el)}
            key={media.id}
            className={`absolute media-card transition-all duration-700 ${
              visibleItems[index] ? "opacity-100 transform-none" : "opacity-0 translate-y-16"
            }`}
            style={{
              top: `${8 + index * 14}%`,
              left: `${index % 2 === 0 ? 5 + index * 8 : 65 - index * 8}%`,
              width: "450px",
              height: "300px",
              transform: `rotate(${index % 2 === 0 ? -2 : 2}deg)`,
              zIndex: displayItems.length - index,
              transitionDelay: `${index * 150}ms`,
              boxShadow: "none", // Explicitly remove box shadow
            }}
          >
            <div className="relative w-full h-full overflow-hidden shadow-none">
              {media.media_type === "video" ? (
                <video
                  src={media.media_url}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                  style={{ filter: "none" }} // Remove any filter effects
                />
              ) : (
                <div className="w-full h-full relative" style={{ boxShadow: "none" }}>
                  <Image
                    src={media.media_url || "/placeholder.svg"}
                    alt="Media content"
                    fill
                    className="object-cover"
                    sizes="450px"
                    style={{ filter: "none" }} // Remove any filter effects
                  />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Content can be overlaid on top of the media cards */}
      <div className="relative z-10 h-full w-full pointer-events-none">
        {/* This space is intentionally left empty for text content to be overlaid from the parent component */}
      </div>
    </div>
  )
}
