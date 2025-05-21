"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"

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

    // Set up polling instead of realtime subscription
    const intervalId = setInterval(() => {
      fetchGridImages()
    }, 300000) // Poll every 5 minutes

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const fetchGridImages = async () => {
    try {
      setLoading(true)

      // Use fetch API instead of Supabase client
      const response = await fetch("/api/photo-grid")

      if (!response.ok) {
        throw new Error(`Error fetching grid images: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      // If we have less than 4 images, fill with placeholders
      const imagesWithFallback = [...(data || [])]
      while (imagesWithFallback.length < 4) {
        imagesWithFallback.push(createPlaceholderImage(imagesWithFallback.length))
      }

      // Only take the first 4 images
      setImages(imagesWithFallback.slice(0, 4))
    } catch (error) {
      console.error("Unexpected error fetching grid images:", error)
      setImages(getDefaultImages())
    } finally {
      setLoading(false)
    }
  }

  const createPlaceholderImage = (index: number): GridImage => ({
    id: `placeholder-${index}`,
    image_url: `/placeholder.svg?height=300&width=300&query=product+image+${index + 1}`,
    position: index,
    title: "Product Category",
    description: "Explore our products",
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
        <Link
          href="/products"
          key={image.id}
          className="group block relative aspect-square overflow-hidden rounded-md shadow-sm"
        >
          <Image
            src={image.image_url || "/placeholder.svg?height=300&width=300&query=product+image"}
            alt={image.title || `Product category ${index + 1}`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 768px) 40vw, 20vw"
          />

          {/* Dark overlay that appears on hover */}
          <div
            className="absolute inset-0 bg-black opacity-0 group-hover:opacity-60 transition-opacity duration-300"
            aria-hidden="true"
          />

          {/* Text container that reveals on hover */}
          {image.title && (
            <div className="absolute inset-0 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="p-4">
                <h3
                  className="text-lg font-semibold"
                  style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}
                >
                  {image.title}
                </h3>
                {image.description && (
                  <p className="text-sm mt-1" style={{ color: "#ffffff", textShadow: "0 1px 2px rgba(0,0,0,0.8)" }}>
                    {image.description}
                  </p>
                )}
              </div>
            </div>
          )}
        </Link>
      ))}
    </div>
  )
}
