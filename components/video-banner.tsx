"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"
import { useInView } from "react-intersection-observer"
import RiverVideoPlayer from "./river-video-player"

interface Video {
  id: string
  title: string
  description: string
  video_url: string
  position: number
  created_at: string
}

interface VideoBannerProps {
  position: number // 0, 1, 2, or 3 to indicate which position to display
}

export default function VideoBanner({ position }: VideoBannerProps) {
  const [videos, setVideos] = useState<Video[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: false })

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
          setVideos([])
        } else {
          setVideos(data || [])
          setError(null)
        }
      } catch (error) {
        setError(`Unexpected error fetching videos`)
        setVideos([])
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

  if (loading) {
    return (
      <div className="video-banner-section flex items-center justify-center">
        <div className="text-white text-xl">Loading videos...</div>
      </div>
    )
  }

  // If error or no videos, show a message
  if (error || videos.length === 0) {
    return (
      <div className="video-banner-section flex items-center justify-center">
        <div className="text-white text-xl">{error || `No videos available for position ${position}`}</div>
      </div>
    )
  }

  return (
    <div ref={ref} className="video-banner-section relative overflow-visible">
      {videos.map((video, index) => (
        <RiverVideoPlayer
          key={video.id}
          videoUrl={video.video_url}
          title={video.title}
          description={video.description}
          totalVideos={videos.length}
          videoIndex={index}
          position={position}
        />
      ))}
    </div>
  )
}
