"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

type ImageData = {
  id: number
  url: string
  alt?: string
  title?: string
  description?: string
}

const fallbackImages: ImageData[] = [
  {
    id: 1,
    url: "/premium-products.png",
    alt: "Premium products",
  },
  {
    id: 2,
    url: "/serene-landscape.png",
    alt: "Serene landscape",
  },
]

export default function SecondaryPhotoGrid() {
  const [images, setImages] = useState<ImageData[]>(fallbackImages)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchImages() {
      try {
        const { data, error } = await supabase
          .from("secondary_grid")
          .select("*")
          .order("position", { ascending: true })
          .limit(2)

        if (error) {
          console.warn("Supabase fetch error:", error)
        }

        if (data && data.length > 0) {
          setImages(data)
        }
      } catch (err) {
        console.error("Unexpected fetch error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center gap-0 animate-pulse">
        {[1, 2].map((i) => (
          <div key={i} className="w-full max-w-[1200px] aspect-[16/9] bg-gray-200 rounded-lg"></div>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col w-full gap-0">
      {images.map((image, index) => (
        <Link href="/lifestyle" key={image.id} className="block w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt || "Lifestyle image"}
              fill
              sizes="100vw"
              className="object-cover"
              priority={index === 0}
            />
            {(image.title || image.description) && (
              <div className="absolute bottom-4 left-4 z-10">
                {image.title && (
                  <h3 className="text-lg font-semibold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.7)]">
                    {image.title}
                  </h3>
                )}
                {image.description && (
                  <p className="text-sm mt-1 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.6)]">{image.description}</p>
                )}
              </div>
            )}
          </div>
        </Link>
      ))}
    </div>
  )
}
