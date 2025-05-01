"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"

interface MediaItem {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
}

interface ImageCarouselProps {
  mediaItems?: MediaItem[]
  interval?: number
  isLoading?: boolean
}

export default function ImageCarousel({ mediaItems = [], interval = 5000, isLoading = false }: ImageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Function to go to the next image
  const goToNextImage = () => {
    if (isTransitioning || mediaItems.length <= 1) return

    setIsTransitioning(true)
    const nextIndex = (currentIndex + 1) % mediaItems.length
    setCurrentIndex(nextIndex)

    // Reset transition state after animation completes
    setTimeout(() => {
      setIsTransitioning(false)
    }, 500)
  }

  // Set up automatic image rotation
  useEffect(() => {
    if (mediaItems.length <= 1) return

    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    // Set up new timeout for next image
    timeoutRef.current = setTimeout(() => {
      goToNextImage()
    }, interval)

    // Cleanup on unmount
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [currentIndex, isTransitioning, mediaItems.length, interval])

  // Reset current index if items change
  useEffect(() => {
    setCurrentIndex(0)
  }, [mediaItems.length])

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#fff5f0]">
        <div className="absolute inset-4 bg-[#ffd6c0] rounded-sm overflow-hidden flex items-center justify-center">
          <div className="animate-pulse text-white text-xl">Loading media...</div>
        </div>
      </div>
    )
  }

  // Empty state
  if (mediaItems.length === 0) {
    return (
      <div className="w-full h-full relative overflow-hidden bg-[#fff5f0]">
        <div className="absolute inset-4 bg-[#ffd6c0] rounded-sm overflow-hidden flex items-center justify-center">
          <div className="text-white text-xl text-center p-6">
            No media items found.
            <br />
            Add media items in the dashboard to display here.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative overflow-hidden bg-[#fff5f0]">
      <div className="absolute inset-4 bg-[#ffd6c0] rounded-sm overflow-hidden">
        {mediaItems.map((item, index) => (
          <div
            key={item.id}
            className={`absolute inset-0 transition-opacity duration-500 ${
              index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {item.media_type === "image" ? (
              <Image
                src={item.media_url || "/placeholder.svg"}
                alt={item.title}
                fill
                className="object-cover"
                priority={index === 0}
              />
            ) : (
              <video src={item.media_url} className="w-full h-full object-cover" autoPlay muted loop playsInline />
            )}

            {/* Content overlay */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-6 text-white">
              <h2 className="text-2xl font-semibold mb-2">{item.title}</h2>
              <p className="text-sm md:text-base">{item.description}</p>
            </div>
          </div>
        ))}

        {/* Navigation dots */}
        {mediaItems.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {mediaItems.map((_, index) => (
              <button
                key={index}
                className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-white" : "bg-white/50"}`}
                onClick={() => {
                  if (!isTransitioning) {
                    setCurrentIndex(index)
                    setIsTransitioning(true)
                    setTimeout(() => setIsTransitioning(false), 500)
                  }
                }}
                aria-label={`Go to item ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
