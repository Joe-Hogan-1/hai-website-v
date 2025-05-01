"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface MediaItem {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  created_at: string
  user_id: string
}

interface MediaManagerProps {
  userId: string
}

export default function MediaManager({ userId }: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<Partial<MediaItem>>({
    title: "",
    description: "",
    media_url: "",
    media_type: "image", // Default to image for better compatibility
  })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tableError, setTableError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    checkTableAndFetchItems()
  }, [])

  // Check if the banner_media table exists and create it if needed
  const checkTableAndFetchItems = async () => {
    try {
      setLoading(true)
      setTableError(null)

      // First try to fetch data to see if the table exists
      const { data, error } = await supabase.from("banner_media").select("*").limit(1)

      if (error) {
        console.error("Error checking banner_media table:", error)

        // If the table doesn't exist, try to create it
        if (error.message.includes("does not exist")) {
          setTableError("The banner_media table doesn't exist. Creating it now...")

          // Create the table
          const { error: createError } = await supabase.rpc("create_banner_media_table")

          if (createError) {
            console.error("Error creating banner_media table:", createError)
            setTableError(
              `Failed to create banner_media table: ${createError.message}. Please contact your administrator.`,
            )
            return
          } else {
            setTableError(null)
            toast.success("Media table created successfully!")
            // After creating the table, fetch items
            fetchMediaItems()
          }
        } else {
          setTableError(`Error accessing media data: ${error.message}. Please check your database permissions.`)
        }
      } else {
        // Table exists, fetch all items
        fetchMediaItems()
      }
    } catch (error) {
      console.error("Unexpected error checking table:", error)
      setTableError("An unexpected error occurred. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  const fetchMediaItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("banner_media").select("*").order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching media items:", error)
        toast.error(`Failed to load media items: ${error.message}`)
        return
      }

      setMediaItems(data || [])
    } catch (error) {
      console.error("Unexpected error fetching media items:", error)
      toast.error("An unexpected error occurred while loading media items")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentMedia({
      title: "",
      description: "",
      media_url: "",
      media_type: "image", // Default to image
    })
    setMediaFile(null)
    setIsEditing(true)
  }

  const handleEdit = (mediaItem: MediaItem) => {
    setCurrentMedia(mediaItem)
    setMediaFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentMedia({
      title: "",
      description: "",
      media_url: "",
      media_type: "image",
    })
    setMediaFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return

    try {
      // First, get the media item to check if it has an image
      const { data: media, error: fetchError } = await supabase
        .from("banner_media")
        .select("media_url")
        .eq("id", id)
        .single()

      if (fetchError) {
        console.error("Error fetching media for deletion:", fetchError)
        toast.error(`Error fetching media: ${fetchError.message}`)
        return
      }

      // Delete the media item
      const { error } = await supabase.from("banner_media").delete().eq("id", id)

      if (error) {
        console.error("Error deleting media item:", error)
        toast.error(`Failed to delete media item: ${error.message}`)
        return
      }

      // If there was a media file, delete it from storage
      if (media?.media_url) {
        const mediaPath = media.media_url.split("/").pop()
        if (mediaPath) {
          const { error: storageError } = await supabase.storage.from("banner-images").remove([mediaPath])
          if (storageError) {
            console.error("Error deleting media file:", storageError)
            // Don't return, as the database record was already deleted
          }
        }
      }

      toast.success("Media item deleted successfully")
      fetchMediaItems()
    } catch (error) {
      console.error("Unexpected error deleting media item:", error)
      toast.error("An unexpected error occurred while deleting the media item")
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("File is too large. Maximum size is 100MB.")
        return
      }

      setMediaFile(file)
    }
  }

  const handleSave = async () => {
    try {
      setIsSaving(true)

      if (!currentMedia.title) {
        toast.error("Title is required")
        return
      }

      let mediaUrl = currentMedia.media_url

      // Upload media if a new one is selected
      if (mediaFile) {
        setUploadProgress(0)

        // Generate a unique filename
        const fileExt = mediaFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        // Upload the file
        const { error: uploadError } = await supabase.storage.from("banner-images").upload(filePath, mediaFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) {
          console.error("Error uploading media file:", uploadError)
          toast.error(`Failed to upload media file: ${uploadError.message}`)
          setIsSaving(false)
          return
        }

        // Get the public URL
        const { data: urlData } = supabase.storage.from("banner-images").getPublicUrl(filePath)

        if (!urlData || !urlData.publicUrl) {
          toast.error("Failed to get public URL for uploaded file")
          setIsSaving(false)
          return
        }

        mediaUrl = urlData.publicUrl
      }

      if (currentMedia.id) {
        // Update existing media item
        const { error } = await supabase
          .from("banner_media")
          .update({
            title: currentMedia.title,
            description: currentMedia.description,
            media_url: mediaUrl,
            media_type: currentMedia.media_type,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentMedia.id)

        if (error) {
          console.error("Error updating media item:", error)
          toast.error(`Failed to update media item: ${error.message}`)
          return
        }

        toast.success("Media item updated successfully")
      } else {
        // Create new media item
        const { error } = await supabase.from("banner_media").insert({
          title: currentMedia.title,
          description: currentMedia.description || "",
          media_url: mediaUrl || "",
          media_type: currentMedia.media_type || "image",
          user_id: userId,
        })

        if (error) {
          console.error("Error creating media item:", error)
          toast.error(`Failed to create media item: ${error.message}`)
          return
        }

        toast.success("Media item created successfully")
      }

      setIsEditing(false)
      fetchMediaItems()
      setCurrentMedia({
        title: "",
        description: "",
        media_url: "",
        media_type: "image",
      })
      setMediaFile(null)
    } catch (error) {
      console.error("Unexpected error saving media item:", error)
      toast.error("An unexpected error occurred while saving the media item")
    } finally {
      setIsSaving(false)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading media items...</div>
  }

  if (tableError) {
    return (
      <Alert variant="destructive" className="mb-6">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{tableError}</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="admin-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Homepage Media Carousel</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Media Item
          </Button>
        )}
      </div>
      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Manage the media items that appear in the homepage carousel. You can add images or videos that will be
          displayed in rotation.
        </p>
        <p className="text-sm text-gray-600 mt-2">
          <strong>Note:</strong> These items will be displayed on the homepage in a carousel format. For best results,
          use high-quality images or videos with a 16:9 aspect ratio.
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentMedia.id ? "Edit Media Item" : "Create New Media Item"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="title"
                value={currentMedia.title || ""}
                onChange={(e) => setCurrentMedia({ ...currentMedia, title: e.target.value })}
                placeholder="Enter media title"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={currentMedia.description || ""}
                onChange={(e) => setCurrentMedia({ ...currentMedia, description: e.target.value })}
                placeholder="Enter media description"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="media_type" className="block text-sm font-medium text-gray-700 mb-1">
                Media Type
              </label>
              <Select
                value={currentMedia.media_type || "image"}
                onValueChange={(value) => setCurrentMedia({ ...currentMedia, media_type: value as "video" | "image" })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-1">
                Media File {!currentMedia.media_url && <span className="text-red-500">*</span>}
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="media"
                  accept={currentMedia.media_type === "video" ? "video/*" : "image/*"}
                  onChange={handleMediaChange}
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#ffd6c0] file:text-white
                  hover:file:bg-[#ffcbb0]"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">
                {currentMedia.media_type === "video" ? "MP4, WebM, Ogg. Max 100MB." : "PNG, JPG, GIF. Max 100MB."}
              </p>
              {currentMedia.media_url && !mediaFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current media: {currentMedia.media_url.split("/").pop()}</p>
                  <div className="mt-2 border rounded p-2 bg-white">
                    {currentMedia.media_type === "video" ? (
                      <video src={currentMedia.media_url} className="w-full h-32 object-cover" controls muted />
                    ) : (
                      <img
                        src={currentMedia.media_url || "/placeholder.svg"}
                        alt={currentMedia.title}
                        className="w-full h-32 object-cover"
                      />
                    )}
                  </div>
                </div>
              )}
              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                  <div className="bg-[#ffd6c0] h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                  <p className="text-xs text-gray-500 mt-1">{Math.round(uploadProgress)}% uploaded</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Media Item
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {mediaItems.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No media items yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Media Item
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {mediaItems.map((mediaItem) => (
                <Card key={mediaItem.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="w-full h-48 bg-gray-100 relative">
                        {mediaItem.media_type === "video" ? (
                          <video src={mediaItem.media_url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img
                            src={mediaItem.media_url || "/placeholder.svg"}
                            alt={mediaItem.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="text-xl font-semibold mb-2">{mediaItem.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{mediaItem.description}</p>
                        <div className="flex justify-end space-x-2 mt-4">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(mediaItem)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(mediaItem.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
