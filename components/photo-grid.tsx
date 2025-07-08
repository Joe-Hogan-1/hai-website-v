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
  link_url?: string
  link_text?: string
  created_at: string
}

export default function PhotoGrid() {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGridImages()
    const intervalId = setInterval(fetchGridImages, 300000)
    return () => clearInterval(intervalId)
  }, [])

  const fetchGridImages = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/photo-grid")
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)
      const data = await response.json()
      if (data.error) throw new Error(data.error)

      const filled = [...(data || [])]
      while (filled.length < 4) {
        filled.push(createPlaceholderImage(filled.length))
      }

      setImages(filled.slice(0, 4))
    } catch (err) {
      console.error("Error fetching grid images:", err)
      setImages(getDefaultImages())
    } finally {
      setLoading(false)
    }
  }

  const createPlaceholderImage = (index: number): GridImage => ({
    id: `placeholder-${index}`,
    image_url: `/placeholder.svg?height=600&width=600&query=product+image+${index + 1}`,
    position: index,
    title: `Product ${index + 1}`,
    description: "Explore our products",
    link_url: "/products",
    link_text: "Shop Now",
    created_at: new Date().toISOString(),
  })

  const getDefaultImages = (): GridImage[] => Array.from({ length: 4 }, (_, i) => createPlaceholderImage(i))

  return (
    <div className="w-[800px] max-w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
        {(loading ? Array(4).fill(null) : images).map((image, index) => (
          <div key={image?.id || index} className="relative aspect-square w-full overflow-hidden group">
            {loading ? (
              <div className="w-full h-full animate-pulse bg-gray-300" />
            ) : (
              <Link href={image.link_url || "/products"} className="block w-full h-full relative">
                <div className="w-full h-full overflow-hidden">
                  <Image
                    src={image.image_url || "/placeholder.svg"}
                    alt={image.title || `Product ${index + 1}`}
                    fill
                    className="object-cover transition-transform duration-500 scale-100 group-hover:scale-110"
                    sizes="(max-width: 1068px) 100vw, 50vw"
                  />
                </div>
                {(image.title || image.description) && (
                  <div className="absolute bottom-4 left-4 z-10">
                    {image.title && (
                      <h3
                        style={{ color: "#ffffff" }}
                        className="text-lg font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]"
                      >
                        {image.title}
                      </h3>
                    )}
                    {image.description && (
                      <p className="text-sm mt-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">
                        {image.description}
                      </p>
                    )}
                  </div>
                )}
              </Link>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
