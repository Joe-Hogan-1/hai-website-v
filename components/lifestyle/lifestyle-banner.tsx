"use client"
import { useState, useEffect } from "react"
import type React from "react"
import Link from "next/link"
import { supabase } from "@/utils/supabase"
import { useMediaQuery } from "@/hooks/use-media-query"

interface LifestyleBanner {
  id: string
  title?: string
  description?: string
  image_url: string
  alt_text?: string
}

export default function LifestyleBanner() {
  const [banners, setBanners] = useState<LifestyleBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [imageHeights, setImageHeights] = useState<{ [key: string]: number }>({})

  // Use media queries for responsive design
  const isMobile = useMediaQuery("(max-width: 640px)")
  const isTablet = useMediaQuery("(min-width: 641px) and (max-width: 1024px)")

  // Fetch banners from Supabase
  useEffect(() => {
    async function fetchBanners() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("lifestyle_banner")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(2) // Only get the first two banners

        if (error) {
          console.error("Error fetching lifestyle banners:", error)
          setBanners([])
        } else {
          setBanners(data || [])
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setBanners([])
      } finally {
        setLoading(false)
      }
    }

    fetchBanners()
  }, [])

  // Handle image load to get actual dimensions
  const handleImageLoad = (event: React.SyntheticEvent<HTMLImageElement>, id: string) => {
    const img = event.currentTarget
    setImageHeights((prev) => ({
      ...prev,
      [id]: img.naturalHeight,
    }))
  }

  // If still loading, show placeholder
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
        <div className="bg-gray-100 animate-pulse flex items-center justify-center h-[300px] md:h-[400px] rounded-lg">
          <p className="text-gray-400">Loading...</p>
        </div>
        <div className="bg-gray-100 animate-pulse flex items-center justify-center h-[300px] md:h-[400px] rounded-lg">
          <p className="text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  // If no banners available, show placeholder
  if (banners.length === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
        <div className="bg-gray-100 flex items-center justify-center h-[300px] md:h-[400px] rounded-lg">
          <p className="text-gray-400">No image available</p>
        </div>
        <div className="bg-gray-100 flex items-center justify-center h-[300px] md:h-[400px] rounded-lg">
          <p className="text-gray-400">No image available</p>
        </div>
      </div>
    )
  }

  // Create an array of exactly two banners
  const displayBanners = [...banners]
  // If we only have one banner, duplicate it to fill both slots
  if (displayBanners.length === 1) {
    displayBanners.push(banners[0])
  }
  // Ensure we only show two banners
  const finalBanners = displayBanners.slice(0, 2)

  return (
    <div className="relative">
      {/* Banner grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 w-full">
        {finalBanners.map((banner, index) => (
          <div
            key={`${banner.id}-${index}`}
            className="relative overflow-hidden rounded-lg flex items-center justify-center"
            style={{ minHeight: "300px" }}
          >
            <div className="w-full h-full flex items-center justify-center">
              <img
                src={banner.image_url || "/placeholder.svg"}
                alt={banner.alt_text || "Lifestyle Banner"}
                className="max-w-full max-h-full object-contain"
                onLoad={(e) => handleImageLoad(e, banner.id)}
              />
            </div>
            {(banner.title || banner.description) && (
              <div
                className={`absolute bottom-0 left-0 right-0 ${isMobile ? "p-3" : isTablet ? "p-4" : "p-5"} bg-black/30 text-white`}
              >
                {banner.title && (
                  <h2
                    className={`${isMobile ? "text-lg" : isTablet ? "text-xl" : "text-2xl"} font-bold mb-1 text-shadow-sm text-left`}
                  >
                    {banner.title}
                  </h2>
                )}
                {banner.description && (
                  <p
                    className={`${isMobile ? "text-xs line-clamp-1" : isTablet ? "text-sm line-clamp-2" : "text-base line-clamp-2"} text-shadow-sm text-left`}
                  >
                    {banner.description}
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Larger button with explicitly white text */}
      <div className="absolute bottom-6 left-6 z-20">
        <Link
          href="/products"
          className="inline-block bg-black text-white font-semibold py-3 px-8 text-lg md:text-xl md:py-4 md:px-10 rounded transition-colors outline-none focus:outline-none focus:ring-0 select-none no-tap-highlight"
          style={{
            color: "white",
            WebkitTapHighlightColor: "none",
            WebkitTouchCallout: "none",
            userSelect: "none",
            MozUserSelect: "none",
            msUserSelect: "none",
            WebkitUserSelect: "none",
            outline: "none",
            textDecoration: "none",
          }}
        >
          <span className="text-white">Shop the Lifestyle.</span>
        </Link>
      </div>
    </div>
  )
}
