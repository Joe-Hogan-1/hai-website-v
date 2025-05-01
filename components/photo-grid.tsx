"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import Image from "next/image"

interface GridImage {
  id: string
  image_url: string
  position: number
  created_at: string
}

export default function PhotoGrid() {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGridImages()

    // Subscribe to changes in the grid_images table
    const channel = supabase
      .channel("grid_images_changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "grid_images" }, () => {
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
      const { data, error } = await supabase
        .from("grid_images")
        .select("*")
        .order("position", { ascending: true })
        .limit(4)

      if (error) {
        console.error("Error fetching grid images:", error)
        setImages(getDefaultImages())
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
        <div key={image.id} className="relative aspect-square overflow-hidden rounded-md shadow-sm">
          <Image
            src={image.image_url || "/placeholder.svg"}
            alt={`Grid image ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 hover:scale-105"
            sizes="(max-width: 768px) 40vw, 20vw"
          />
        </div>
      ))}
    </div>
  )
}
