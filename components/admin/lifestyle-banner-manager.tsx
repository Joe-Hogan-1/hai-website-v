"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { uploadToBannerImages, deleteFromBannerImages } from "@/utils/supabase-storage"

interface LifestyleBanner {
  id: string
  title?: string
  description?: string
  image_url: string
  alt_text?: string
  is_active: boolean
}

export default function LifestyleBannerManager({ userId }: { userId: string }) {
  const [banner, setBanner] = useState<LifestyleBanner | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [altText, setAltText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchBanner()
  }, [])

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
        console.error("Error fetching banner:", error)
        setBanner(null)
      } else {
        setBanner(data)
        if (data) {
          setTitle(data.title || "")
          setDescription(data.description || "")
          setAltText(data.alt_text || "")
        }
      }
    } catch (error) {
      console.error("Unexpected error:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)

      // Use the existing utility function to upload to banner-images bucket
      const { url } = await uploadToBannerImages(file)

      // Save to database
      await saveBannerToDatabase(url)

      toast({
        title: "Success",
        description: "Banner image uploaded successfully",
      })

      fetchBanner()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: "Failed to upload banner image",
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function saveBannerToDatabase(imageUrl: string) {
    try {
      // If we're replacing an image, delete the old one from storage
      if (banner?.image_url) {
        try {
          await deleteFromBannerImages(banner.image_url)
        } catch (error) {
          console.error("Error deleting old image:", error)
          // Continue even if delete fails
        }
      }

      // Prepare data object
      const data = {
        title,
        description,
        image_url: imageUrl,
        alt_text: altText,
        is_active: true,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      // Check if banner already exists
      if (banner) {
        // Update existing banner
        const { error } = await supabase.from("lifestyle_banner").update(data).eq("id", banner.id)

        if (error) throw error
      } else {
        // Create new banner
        const { error } = await supabase.from("lifestyle_banner").insert({
          ...data,
          created_at: new Date().toISOString(),
        })

        if (error) throw error
      }
    } catch (error) {
      console.error("Error saving to database:", error)
      throw error
    }
  }

  async function updateBannerDetails() {
    if (!banner) return

    try {
      const { error } = await supabase
        .from("lifestyle_banner")
        .update({
          title,
          description,
          alt_text: altText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", banner.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Banner details updated successfully",
      })

      fetchBanner()
    } catch (error) {
      console.error("Error updating banner details:", error)
      toast({
        title: "Error",
        description: "Failed to update banner details",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lifestyle Banner Manager</h2>

      {loading ? (
        <div className="animate-pulse bg-gray-200 h-40 rounded-md"></div>
      ) : (
        <>
          {banner && (
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-2">Current Banner:</p>
              <img
                src={banner.image_url || "/placeholder.svg"}
                alt={banner.alt_text || "Lifestyle Banner"}
                className="w-full h-40 object-cover rounded-md"
              />
            </div>
          )}

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Upload New Banner</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-800"
            />
            {uploading && <p className="text-sm text-gray-500 mt-1">Uploading...</p>}
          </div>

          <div className="space-y-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Banner title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Banner description"
                rows={2}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
              <input
                type="text"
                value={altText}
                onChange={(e) => setAltText(e.target.value)}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                placeholder="Describe the image for accessibility"
              />
            </div>

            <button
              onClick={updateBannerDetails}
              disabled={!banner}
              className="w-full rounded-md bg-black px-3 py-2 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"
            >
              Update Banner Details
            </button>
          </div>

          <p className="text-xs text-gray-500 mt-2">
            Recommended size: 1200x600 pixels. The banner will be displayed on the lifestyle page.
          </p>
        </>
      )}
    </div>
  )
}
