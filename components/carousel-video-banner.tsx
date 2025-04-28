"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import { ChevronLeft, ChevronRight, X } from "lucide-react"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  position: number
  created_at: string
}

interface CarouselVideoBannerProps {
  position: number
}

export default function CarouselVideoBanner({ position }: CarouselVideoBannerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [theaterMode, setTheaterMode] = useState(false)
  const [theaterVideoSrc, setTheaterVideoSrc] = useState<string | null>(null)

  // Single video ref instead of two
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    async function fetchVideos() {
      try {
        const { data, error } = await supabase
          .from("banner_videos")
          .select("*")
          .eq("position", position)
          .order("created_at", { ascending: false })

        if (error) {
          setError(`Error fetching videos: ${error.message}`)
          setVideos(getFallbackVideos())
        } else {
          setVideos(data && data.length > 0 ? data : getFallbackVideos())
        }
      } catch (error) {
        setError(`Unexpected error fetching videos`)
        setVideos(getFallbackVideos())
      } finally {
        setLoading(false)
      }
    }

    fetchVideos()

    // Subscribe to changes in the banner_videos table for this position
    const channel = supabase
      .channel(`banner_video_${position}_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "banner_videos",
          filter: `position=eq.${position}`,
        },
        (payload) => {
          fetchVideos()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [position])

  // Initialize video when it changes
  useEffect(() => {
    if (videos.length > 0 && videoRef.current) {
      videoRef.current.load()
      videoRef.current.play().catch((err) => console.error("Error playing video:", err))
    }
  }, [videos, currentIndex])

  // Function to go to the next video without fading
  const goToNextVideo = useCallback(() => {
    if (videos.length <= 1) return
    const next = (currentIndex + 1) % videos.length
    setCurrentIndex(next)
  }, [currentIndex, videos.length])

  // Function to go to the previous video without fading
  const goToPrevVideo = useCallback(() => {
    if (videos.length <= 1) return
    const prev = (currentIndex - 1 + videos.length) % videos.length
    setCurrentIndex(prev)
  }, [currentIndex, videos.length])

  // Function to go to a specific video
  const goToVideo = useCallback(
    (index: number) => {
      if (index === currentIndex) return
      setCurrentIndex(index)
    },
    [currentIndex],
  )

  // Auto-rotate videos
  useEffect(() => {
    if (videos.length <= 1 || theaterMode) return

    const rotationTimer = setInterval(() => {
      goToNextVideo()
    }, 4000) // Change video every 4 seconds

    return () => clearInterval(rotationTimer)
  }, [videos.length, goToNextVideo, theaterMode])

  // Fallback videos in case no videos are found in the database
  function getFallbackVideos(): Video[] {
    return [
      {
        id: "fallback-1",
        title: "Welcome to hai.",
        description: "Discover our premium products for your wellness journey",
        video_url: "/videos/fallback-video.mp4",
        position: 0,
        created_at: new Date().toISOString(),
      },
    ]
  }

  const openTheaterMode = (videoUrl: string) => {
    // Set theater mode state first
    setTheaterVideoSrc(videoUrl)

    // Pause the current video to avoid having two videos playing at once
    if (videoRef.current) {
      videoRef.current.pause()
    }

    // Add the class after a small delay to avoid jittering
    setTimeout(() => {
      document.body.classList.add("theater-mode-active")
      setTheaterMode(true)
    }, 10)
  }

  const closeTheaterMode = () => {
    // Remove the class first
    document.body.classList.remove("theater-mode-active")

    // Set theater mode state after a small delay
    setTimeout(() => {
      setTheaterMode(false)
      setTheaterVideoSrc(null)

      // Resume the current video if it was playing before
      if (videoRef.current) {
        videoRef.current.play().catch((err) => console.error("Error resuming video:", err))
      }
    }, 10)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100/20 backdrop-blur-sm rounded-lg">
        <div className="text-white text-xl">Loading videos...</div>
      </div>
    )
  }

  if (videos.length === 0) {
    return (
      <div className="flex items-center justify-center h-full w-full bg-gray-100/20 backdrop-blur-sm rounded-lg">
        <div className="text-white text-xl">No videos available</div>
      </div>
    )
  }

  const currentVideo = videos[currentIndex]

  return (
    <div className="relative h-full w-full carousel-video-banner">
      {/* Current Video */}
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-sm rounded-lg overflow-hidden"
        onClick={() => openTheaterMode(currentVideo.video_url)}
      >
        <video
          ref={videoRef}
          src={currentVideo.video_url}
          className="w-full h-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          onClick={(e) => {
            e.stopPropagation() // Prevent double firing
            openTheaterMode(currentVideo.video_url)
          }}
        />
      </div>

      {/* Content overlay */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 bg-gradient-to-t from-black/70 to-transparent pointer-events-none">
        <div>
          <h2 className="text-2xl md:text-3xl font-semibold text-white mb-2">{currentVideo.title}</h2>
          <p className="text-white/90 mb-4">{currentVideo.description}</p>
        </div>
      </div>

      {/* Navigation buttons */}
      {videos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent opening theater mode
              goToPrevVideo()
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors carousel-nav-button pointer-events-auto"
            aria-label="Previous video"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation() // Prevent opening theater mode
              goToNextVideo()
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-2 rounded-full transition-colors carousel-nav-button pointer-events-auto"
            aria-label="Next video"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Video indicators */}
      {videos.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2 pointer-events-auto z-10">
          {videos.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation() // Prevent opening theater mode
                goToVideo(index)
              }}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentIndex ? "bg-white" : "bg-white/50 hover:bg-white/70"
              }`}
              aria-label={`Go to video ${index + 1}`}
            />
          ))}
        </div>
      )}

      {/* Theater Mode */}
      {theaterMode && theaterVideoSrc && (
        <div
          className="fixed inset-0 z-[200] bg-black flex items-center justify-center"
          onClick={closeTheaterMode}
          style={{ backdropFilter: "none" }} // Remove backdrop filter which can cause jitter
        >
          <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
            <button
              className="absolute top-4 right-4 z-10 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
              onClick={closeTheaterMode}
              aria-label="Close theater mode"
            >
              <X size={24} />
            </button>
            <video
              src={theaterVideoSrc}
              className="w-full rounded-lg"
              controls
              autoPlay
              playsInline
              onEnded={closeTheaterMode}
            />
          </div>
        </div>
      )}
    </div>
  )
}
