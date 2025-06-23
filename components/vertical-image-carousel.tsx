"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { useMediaQuery } from "@/hooks/use-media-query" // Import useMediaQuery

type VerticalCarouselItem = {
  id: string
  image_url: string
  title?: string
  description?: string
  link_url?: string
  link_text?: string
  position: number
}

export default function VerticalImageCarousel() {
  const [items, setItems] = useState<VerticalCarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const isDesktop = useMediaQuery("(min-width: 768px)") // md breakpoint

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/vertical-carousel")
        if (!response.ok) {
          throw new Error("Failed to fetch vertical carousel items")
        }
        const data = await response.json()
        setItems(data.sort((a: VerticalCarouselItem, b: VerticalCarouselItem) => a.position - b.position))
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
        console.error("Error fetching vertical carousel items:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchItems()
  }, [])

  const handlePrev = () => {
    if (!isDesktop) return // Navigation only for desktop
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    if (!isDesktop) return // Navigation only for desktop
    // On desktop, we show 3 items. So, length - 3 is the last possible starting index.
    setCurrentIndex((prev) => (prev < items.length - 3 ? prev + 1 : prev))
  }

  const showNavigation = isDesktop && items.length > 3

  if (loading) {
    return (
      <div className="w-full h-[400px] md:h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return <div className="w-full p-4 bg-red-50 text-red-700 rounded-md">Error loading carousel: {error}</div>
  }

  if (items.length === 0) {
    return null
  }

  return (
    <div className="relative w-full">
      {/* Navigation buttons - only show on desktop */}
      {showNavigation && (
        <>
          <button
            onClick={handlePrev}
            disabled={currentIndex === 0}
            className={`absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-md ${
              currentIndex === 0 ? "opacity-50 cursor-not-allowed" : "hover:bg-white"
            }`}
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={handleNext}
            disabled={currentIndex >= items.length - 3}
            className={`absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-white/80 shadow-md ${
              currentIndex >= items.length - 3 ? "opacity-50 cursor-not-allowed" : "hover:bg-white"
            }`}
            aria-label="Next slide"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      {/* Carousel container */}
      <div ref={carouselRef} className="w-full overflow-hidden">
        <div
          className="flex flex-col md:flex-row md:transition-transform md:duration-300 md:ease-in-out"
          style={{
            transform: isDesktop ? `translateX(-${currentIndex * (100 / 3)}%)` : "none",
          }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-full md:w-1/3 md:flex-shrink-0 px-2 mb-4 md:mb-0">
              <Link
                href="/lifestyle"
                className="block h-[400px] md:h-[600px] relative group overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title || "Carousel image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                {(item.title || item.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4 md:p-6 bg-gradient-to-t from-black/70 via-black/40 to-transparent">
                    {item.title && (
                      <h3 className="text-lg md:text-xl font-bold text-white mb-1 md:mb-2 drop-shadow-md">
                        {item.title}
                      </h3>
                    )}
                    {item.description && (
                      <p className="text-sm text-white line-clamp-2 md:line-clamp-3 drop-shadow-md">
                        {item.description}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            </div>
          ))}
        </div>
      </div>

      {/* Text and button below carousel */}
      <div className="mt-8 md:mt-12 text-center">
        <p className="text-xl md:text-2xl font-medium mb-4 md:mb-6">from sunrise to after hours - we've got you.</p>
        <Link
          href="/products"
          className="inline-flex px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm font-medium"
        >
          Shop Essentials
        </Link>
      </div>
    </div>
  )
}
