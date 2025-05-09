"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import Image from "next/image"

interface GridImage {
  id: string
  image_url: string
  position: number
  title?: string
  description?: string
  created_at: string
}

export default function PhotoGrid() {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGridImages()

    // Subscribe to changes in the photo_grid table
    const channel = supabase
      .channel("photo_grid_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "photo_grid" }, () => {
        fetchGridImages()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  const fetchGridImages = async () => {
    try {
      setLoading(true)

      // First try to fetch from photo_grid table
      const { data, error } = await supabase
        .from("photo_grid")
        .select("*")
        .order("position", { ascending: true })
        .limit(4)

      if (error) {
        console.error("Error fetching from photo_grid:", error)

        // Fall back to grid_images table if photo_grid fails
        const { data: fallbackData, error: fallbackError } = await supabase
          .from("grid_images")
          .select("*")
          .order("position", { ascending: true })
          .limit(4)

        if (fallbackError) {
          console.error("Error fetching from grid_images:", fallbackError)
          setImages(getDefaultImages())
        } else {
          // Map grid_images data to match photo_grid structure
          const mappedData = (fallbackData || []).map((img) => ({
            ...img,
            title: null,
            description: null,
          }))

          // Fill with placeholders if needed
          const imagesWithFallback = [...mappedData]
          while (imagesWithFallback.length < 4) {
            imagesWithFallback.push(createPlaceholderImage(imagesWithFallback.length))
          }
          setImages(imagesWithFallback.slice(0, 4))
        }
      } else {
        // If we have less than 4 images, fill with placeholders
        const imagesWithFallback = [...(data || [])]
        while (imagesWithFallback.length < 4) {
          imagesWithFallback.push(createPlaceholderImage(imagesWithFallback.length))
        }
        // Only take the first 4 images
        setImages(imagesWithFallback.slice(0, 4))
      }
    } catch (error) {
      console.error("Unexpected error fetching grid images:", error)
      setImages(getDefaultImages())
    } finally {
      setLoading(false)
    }
  }

  const createPlaceholderImage = (index: number): GridImage => ({
    id: `placeholder-${index}`,
    image_url: `/placeholder.svg?height=300&width=300`,
    position: index,
    title: "Placeholder Image",
    description: "This is a placeholder image",
    created_at: new Date().toISOString(),
  })

  const getDefaultImages = (): GridImage[] => {
    return Array.from({ length: 4 }, (_, i) => createPlaceholderImage(i))
  }

  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-3 w-full h-full">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="aspect-square bg-gray-200 animate-pulse rounded-md"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-3 w-full h-full">
      {images.map((image, index) => (
        <div key={image.id} className="relative aspect-square overflow-hidden rounded-md shadow-sm group">
          <Image
            src={image.image_url || "/placeholder.svg"}
            alt={image.title || `Grid image ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 40vw, 20vw"
          />
          {image.title && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all duration-300 flex items-end">
              <div className="p-3 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <h3 className="text-lg font-semibold">{image.title}</h3>
                {image.description && <p className="text-sm mt-1">{image.description}</p>}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
