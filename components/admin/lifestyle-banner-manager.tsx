"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useToast } from "@/hooks/use-toast"
import { uploadToBannerImages, deleteFromBannerImages } from "@/utils/supabase-storage"
import { Trash2, Edit, Check, X } from "lucide-react"

interface LifestyleBanner {
  id: string
  title?: string
  description?: string
  image_url: string
  alt_text?: string
  is_active: boolean
}

export default function LifestyleBannerManager({ userId }: { userId: string }) {
  const [banners, setBanners] = useState<LifestyleBanner[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [editingBannerId, setEditingBannerId] = useState<string | null>(null)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [altText, setAltText] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      setLoading(true)

      // Try to fetch from Supabase
      const { data, error } = await supabase
        .from("lifestyle_banner")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching banners:", error)
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

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      setUploading(true)

      // Upload directly to the banner-images bucket
      const { url } = await uploadToBannerImages(file)

      // Save to database
      await saveBannerToDatabase(url)

      toast({
        title: "Success",
        description: "Banner image uploaded successfully",
      })

      fetchBanners()
    } catch (error) {
      console.error("Error uploading file:", error)
      toast({
        title: "Error",
        description: `Failed to upload banner image: ${error.message || "Unknown error"}`,
        variant: "destructive",
      })
    } finally {
      setUploading(false)
    }
  }

  async function saveBannerToDatabase(imageUrl: string) {
    try {
      // Prepare data object
      const data = {
        title: "",
        description: "",
        image_url: imageUrl,
        alt_text: "Lifestyle Banner",
        is_active: true,
        user_id: userId,
        updated_at: new Date().toISOString(),
      }

      // Create new banner
      const { error } = await supabase.from("lifestyle_banner").insert({
        ...data,
        created_at: new Date().toISOString(),
      })

      if (error) throw error
    } catch (error) {
      console.error("Error saving to database:", error)
      throw error
    }
  }

  function startEditing(banner: LifestyleBanner) {
    setEditingBannerId(banner.id)
    setTitle(banner.title || "")
    setDescription(banner.description || "")
    setAltText(banner.alt_text || "")
  }

  function cancelEditing() {
    setEditingBannerId(null)
    setTitle("")
    setDescription("")
    setAltText("")
  }

  async function updateBannerDetails(bannerId: string) {
    try {
      const { error } = await supabase
        .from("lifestyle_banner")
        .update({
          title,
          description,
          alt_text: altText,
          updated_at: new Date().toISOString(),
        })
        .eq("id", bannerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Banner details updated successfully",
      })

      fetchBanners()
      cancelEditing()
    } catch (error) {
      console.error("Error updating banner details:", error)
      toast({
        title: "Error",
        description: "Failed to update banner details",
        variant: "destructive",
      })
    }
  }

  async function deleteBanner(bannerId: string, imageUrl: string) {
    try {
      // Delete from storage
      try {
        await deleteFromBannerImages(imageUrl)
      } catch (error) {
        console.error("Error deleting image from storage:", error)
        // Continue even if delete from storage fails
      }

      // Delete from database
      const { error } = await supabase.from("lifestyle_banner").delete().eq("id", bannerId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Banner deleted successfully",
      })

      fetchBanners()
    } catch (error) {
      console.error("Error deleting banner:", error)
      toast({
        title: "Error",
        description: "Failed to delete banner",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Lifestyle Banner Carousel Manager</h2>
      <p className="text-sm text-gray-500 mb-4">
        Upload multiple banners to create a carousel on the lifestyle page. Banners will automatically rotate.
      </p>

      {loading ? (
        <div className="animate-pulse bg-gray-200 h-40 rounded-md"></div>
      ) : (
        <>
          <div className="mb-6">
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

          <div className="space-y-4">
            <h3 className="text-md font-medium">Current Banners ({banners.length})</h3>

            {banners.length === 0 ? (
              <p className="text-sm text-gray-500">No banners uploaded yet. Upload a banner to get started.</p>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {banners.map((banner) => (
                  <div key={banner.id} className="border rounded-md p-4">
                    {editingBannerId === banner.id ? (
                      // Editing mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={banner.image_url || "/placeholder.svg"}
                            alt={banner.alt_text || "Banner"}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={title}
                              onChange={(e) => setTitle(e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              placeholder="Banner title (optional)"
                            />
                            <input
                              type="text"
                              value={altText}
                              onChange={(e) => setAltText(e.target.value)}
                              className="w-full rounded-md border border-gray-300 px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                              placeholder="Alt text for accessibility"
                            />
                          </div>
                        </div>

                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-black"
                          placeholder="Banner description (optional)"
                          rows={2}
                        />

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={cancelEditing}
                            className="rounded-md bg-gray-200 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-300"
                          >
                            <X size={16} className="inline mr-1" /> Cancel
                          </button>
                          <button
                            onClick={() => updateBannerDetails(banner.id)}
                            className="rounded-md bg-black px-3 py-1 text-sm font-semibold text-white hover:bg-gray-800"
                          >
                            <Check size={16} className="inline mr-1" /> Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      // View mode
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <img
                            src={banner.image_url || "/placeholder.svg"}
                            alt={banner.alt_text || "Banner"}
                            className="w-20 h-20 object-cover rounded-md"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium">{banner.title || "Untitled Banner"}</h4>
                            <p className="text-sm text-gray-500 truncate">{banner.alt_text || "No alt text"}</p>
                          </div>
                        </div>

                        {banner.description && (
                          <p className="text-sm text-gray-700 line-clamp-2">{banner.description}</p>
                        )}

                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => startEditing(banner)}
                            className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700 hover:bg-gray-200"
                          >
                            <Edit size={16} className="inline mr-1" /> Edit
                          </button>
                          <button
                            onClick={() => deleteBanner(banner.id, banner.image_url)}
                            className="rounded-md bg-red-100 px-3 py-1 text-sm font-medium text-red-700 hover:bg-red-200"
                          >
                            <Trash2 size={16} className="inline mr-1" /> Delete
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <p className="text-xs text-gray-500 mt-4">
            Recommended size: 1600x800 pixels. The banners will automatically rotate in a carousel on the lifestyle
            page.
          </p>
        </>
      )}
    </div>
  )
}
