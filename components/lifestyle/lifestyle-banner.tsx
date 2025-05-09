"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

interface LifestyleBanner {
  id: string
  title?: string
  description?: string
  image_url: string
  alt_text?: string
}

export default function LifestyleBanner() {
  const [banner, setBanner] = useState<LifestyleBanner | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBanner() {
      try {
        setLoading(true)

        // Try to fetch from Supabase
        const { data, error } = await supabase
          .from("lifestyle_banner")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

        if (error && !error.message.includes("No rows found")) {
          setError(`Failed to load banner: ${error.message}`)
          setBanner(null)
        } else {
          setBanner(data)
        }
      } catch (error) {
        setError("An unexpected error occurred while loading the banner")
        setBanner(null)
      } finally {
        setLoading(false)
      }
    }

    fetchBanner()
  }, [])

  // Fallback image if no banner is found
  const fallbackImage = "/serene-landscape.png"

  if (loading) {
    return (
      <div className="w-full h-full bg-[#ffd6c0]/30 rounded-lg animate-pulse flex items-center justify-center">
        <p className="text-black/50">Loading banner...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className="w-full h-full bg-[#ffd6c0]/30 rounded-lg flex items-center justify-center p-6">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
      <div className="relative w-full h-full">
        <img
          src={banner?.image_url || fallbackImage}
          alt={banner?.alt_text || "Lifestyle Banner"}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
        {banner?.title && <h2 className="text-3xl font-bold text-white drop-shadow-lg">{banner.title}</h2>}
        {!banner?.title && <h2 className="text-3xl font-bold text-white drop-shadow-lg">Explore Our Lifestyle</h2>}
        {banner?.description && <p className="text-white/90 mt-2 drop-shadow-md max-w-md">{banner.description}</p>}
        {!banner?.description && (
          <p className="text-white/90 mt-2 drop-shadow-md max-w-md">
            Discover articles, tips, and stories about cannabis culture and lifestyle.
          </p>
        )}
      </div>
    </div>
  )
}
