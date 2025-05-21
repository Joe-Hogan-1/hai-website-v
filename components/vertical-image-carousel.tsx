"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

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

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true)
        const response = await fetch("/api/vertical-carousel")
        if (!response.ok) {
          throw new Error("Failed to fetch vertical carousel items")
        }
        const data = await response.json()
        setItems(data)
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
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : 0))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < items.length - 3 ? prev + 1 : prev))
  }

  // Determine if we need navigation buttons
  const showNavigation = items.length > 3

  if (loading) {
    return (
      <div className="w-full h-[600px] flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  if (error) {
    return <div className="w-full p-4 bg-red-50 text-red-700 rounded-md">Error loading carousel: {error}</div>
  }

  if (items.length === 0) {
    return null // Don't show anything if there are no items
  }

  return (
    <div className="relative w-full">
      {/* Navigation buttons */}
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
          className="flex transition-transform duration-300 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * (100 / 3)}%)` }}
        >
          {items.map((item) => (
            <div key={item.id} className="w-1/3 flex-shrink-0 px-2">
              <div className="h-[600px] relative group overflow-hidden rounded-lg">
                {/* Image */}
                <div className="absolute inset-0">
                  <img
                    src={item.image_url || "/placeholder.svg"}
                    alt={item.title || "Carousel image"}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>

                {/* Content overlay - only show if there's content */}
                {(item.title || item.description || item.link_url) && (
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    {item.title && <h3 className="text-xl font-bold text-white mb-2 drop-shadow-md">{item.title}</h3>}
                    {item.description && (
                      <p className="text-white mb-4 line-clamp-3 drop-shadow-md">{item.description}</p>
                    )}
                    {item.link_url && (
                      <Link
                        href={item.link_url}
                        className="inline-flex px-4 py-2 bg-white text-black rounded-md hover:bg-gray-100 transition-colors text-sm font-medium"
                      >
                        {item.link_text || "Learn More"}
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Text and button below carousel */}
      <div className="mt-12 text-center">
        <p className="text-2xl font-medium mb-6">from sunrise to after hours - we've got you.</p>
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
