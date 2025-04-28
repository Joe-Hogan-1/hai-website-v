"use client"

import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"
import { X } from "lucide-react"

interface RiverVideoPlayerProps {
  videoUrl: string
  title: string
  description: string
  totalVideos?: number
  videoIndex?: number
  position?: number
}

export default function RiverVideoPlayer({
  videoUrl,
  title,
  description,
  totalVideos = 1,
  videoIndex = 0,
  position = 0,
}: RiverVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const theaterVideoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [theaterMode, setTheaterMode] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  // Calculate deterministic positions based on video index
  // This ensures consistent positioning instead of random

  // Determine vertical position based on index (evenly distributed)
  const startPositionY = useRef(10 + (videoIndex % 3) * 25) // 10%, 35%, or 60% from top

  // Alternate flow direction based on even/odd index
  const flowDirection = useRef(position === 3 ? "left" : videoIndex % 2 === 0 ? "right" : "left")

  // Stagger flow durations slightly
  const flowDuration = useRef(30 + (videoIndex % 3) * 5) // 30s, 35s, or 40s

  // Stagger delays to prevent all videos starting at once
  const flowDelay = useRef(videoIndex * 2) // 0s, 2s, 4s, etc.

  // Minimal vertical movement
  const verticalMovement = useRef(5)

  // No rotation
  const rotationAmount = useRef(0)

  // Calculate width based on total videos (smaller when more videos)
  const videoWidth = useRef(Math.max(30, 50 - totalVideos * 10)) // 50% for 1 video, down to 30% for 3+ videos

  // Log video URL for debugging
  useEffect(() => {
    if (!videoUrl) {
      setVideoError("No video URL provided")
    }
  }, [videoUrl])

  // Handle video errors
  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
    setVideoError("Failed to load video")
  }

  // Update the river-video-wrapper hover effect
  const handleVideoHover = () => {
    if (videoRef.current) {
      // You could add additional hover effects here if needed
    }
  }

  // Replace the useEffect for inView with this improved version that handles play promises properly
  useEffect(() => {
    let playPromise: Promise<void> | undefined
    let isComponentMounted = true

    const handleVideoPlayback = async () => {
      if (!isComponentMounted) return

      if (inView && !theaterMode && videoRef.current) {
        try {
          // Only attempt to play if the video is paused and in view
          if (videoRef.current.paused) {
            setIsPlaying(true)
            // Use low-quality video for better performance
            videoRef.current.playbackQuality = "low"
            // Reduce the playback rate slightly for better performance
            videoRef.current.playbackRate = 0.9
            playPromise = videoRef.current.play()

            // Wait for the play promise to resolve
            if (playPromise !== undefined) {
              await playPromise
            }
          }
        } catch (error) {
          // Video play error - silent fail
        }
      } else if ((!inView || theaterMode) && videoRef.current) {
        try {
          // Pause the video when not in view to save resources
          if (!videoRef.current.paused && playPromise === undefined) {
            setIsPlaying(false)
            videoRef.current.pause()
          }
        } catch (error) {
          // Video pause error - silent fail
        }
      }
    }

    handleVideoPlayback()

    return () => {
      isComponentMounted = false
      // Ensure we clean up any playing videos when component unmounts
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }
    }
  }, [inView, theaterMode])

  // Replace the toggleTheaterMode function with this improved version
  const toggleTheaterMode = async () => {
    const newTheaterMode = !theaterMode

    if (newTheaterMode) {
      // When entering theater mode
      document.body.classList.add("overflow-hidden")
      document.body.classList.add("theater-mode-active")

      // First pause the thumbnail video
      if (videoRef.current && !videoRef.current.paused) {
        videoRef.current.pause()
      }

      // Then set up and play the theater video
      if (videoRef.current && theaterVideoRef.current) {
        theaterVideoRef.current.currentTime = videoRef.current.currentTime
        try {
          // Use a timeout to ensure the pause operation completes first
          setTimeout(() => {
            if (theaterVideoRef.current) {
              theaterVideoRef.current.play().catch(() => {
                /* Theater video play error */
              })
            }
          }, 50)
        } catch (error) {
          // Theater mode video play error
        }
      }
    } else {
      // When exiting theater mode
      document.body.classList.remove("overflow-hidden")
      document.body.classList.remove("theater-mode-active")

      // First pause the theater video
      if (theaterVideoRef.current && !theaterVideoRef.current.paused) {
        theaterVideoRef.current.pause()
      }

      // Then set up and play the thumbnail video if it's in view
      if (videoRef.current && theaterVideoRef.current && inView) {
        videoRef.current.currentTime = theaterVideoRef.current.currentTime
        try {
          // Use a timeout to ensure the pause operation completes first
          setTimeout(() => {
            if (videoRef.current && inView) {
              videoRef.current.play().catch(() => {
                /* Thumbnail video play error */
              })
            }
          }, 50)
        } catch (error) {
          // Thumbnail video play error
        }
      }
    }

    setTheaterMode(newTheaterMode)
  }

  // Close theater mode when ESC key is pressed
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" && theaterMode) {
        toggleTheaterMode()
      }
    }

    window.addEventListener("keydown", handleEscKey)
    return () => {
      window.removeEventListener("keydown", handleEscKey)
    }
  }, [theaterMode])

  return (
    <>
      <div
        ref={ref}
        className={`river-container transition-opacity duration-1000 ${inView ? "opacity-100" : "opacity-0"}`}
        style={{
          width: `${videoWidth.current}%`,
          top: `${startPositionY.current}%`,
          animation: `flow-${flowDirection.current} ${flowDuration.current}s linear infinite, 
                    vertical-drift ${flowDuration.current * 0.5}s ease-in-out infinite`,
          animationDelay: `${flowDelay.current}s, ${flowDelay.current}s`,
          animationPlayState: theaterMode ? "paused" : "running",
          zIndex: 20,
        }}
      >
        <div
          className={`river-video-box ${theaterMode ? "theater-active" : ""}`}
          style={{
            transform: `rotate(${rotationAmount.current}deg)`,
          }}
        >
          <div
            className="river-video-wrapper cursor-pointer"
            onClick={toggleTheaterMode}
            onMouseEnter={handleVideoHover}
          >
            {videoError ? (
              <div className="video-error-message">
                <p>{videoError}</p>
              </div>
            ) : (
              <video
                ref={videoRef}
                src={videoUrl}
                autoPlay={isPlaying}
                loop
                muted
                playsInline
                className="river-video"
                onError={handleVideoError}
              />
            )}

            <div className="play-indicator">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-12 h-12">
                <path
                  fillRule="evenodd"
                  d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm14.024-.983a1.125 1.125 0 010 1.966l-5.603 3.113A1.125 1.125 0 019 15.113V8.887c0-.857.921-1.4 1.671-.983l5.603 3.113z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          </div>

          <div className="river-content pointer-events-none">
            <h2 className="text-xl md:text-2xl font-semibold mb-1">{title}</h2>
            <p className="text-sm md:text-base">{description}</p>
          </div>
        </div>
      </div>

      {/* Theater Mode Overlay */}
      {theaterMode && (
        <div className="theater-overlay" onClick={toggleTheaterMode}>
          <div className="theater-container" onClick={(e) => e.stopPropagation()}>
            <button className="theater-close-btn" onClick={toggleTheaterMode} aria-label="Close theater mode">
              <X size={24} />
            </button>

            <div className="theater-video-wrapper">
              {videoError ? (
                <div className="video-error-message theater">
                  <p>{videoError}</p>
                </div>
              ) : (
                <video
                  ref={theaterVideoRef}
                  src={videoUrl}
                  autoPlay
                  controls
                  loop
                  className="theater-video"
                  onError={handleVideoError}
                />
              )}
            </div>

            <div className="theater-content">
              <h2 className="text-2xl md:text-3xl font-semibold mb-2">{title}</h2>
              <p className="text-base md:text-lg">{description}</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
