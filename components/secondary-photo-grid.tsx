"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SecondaryPhotoGrid() {
  const [images, setImages] = useState([
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
  ])
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
          console.log("Error fetching secondary grid images:", error)
          setLoading(false)
          return
        }

        if (data && data.length > 0) {
          setImages(data)
        }
      } catch (error) {
        console.error("Error in fetchImages:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImages()
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col animate-pulse">
        <div className="w-full aspect-[16/9] bg-gray-200"></div>
        <div className="w-full aspect-[16/9] bg-gray-200 mt-1"></div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      {images.slice(0, 2).map((image, index) => (
        <Link
          href="/lifestyle"
          key={image.id}
          className={`block cursor-pointer transition-opacity hover:opacity-90 ${index > 0 ? "mt-1" : ""}`}
        >
          <div className="relative w-full aspect-[16/9]">
            <Image
              src={image.url || "/placeholder.svg"}
              alt={image.alt || "Lifestyle image - Click to explore"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority={index === 0}
            />
          </div>
        </Link>
      ))}
    </div>
  )
}
