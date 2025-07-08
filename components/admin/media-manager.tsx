"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { uploadToBannerImages, deleteFromBannerImages } from "@/utils/supabase-storage"
import { PlusCircle, Edit, Trash2, Save, X, AlertCircle, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

interface MediaItem {
  id: number
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  is_active: boolean
  display_order: number
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
    media_type: "image",
    is_active: true,
    display_order: 0,
  })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [tableError, setTableError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchMediaItems()
  }, [])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("banner_media")
        .select("*")
        .order("display_order", { ascending: true })

      if (error) {
        console.error("Error fetching media items:", error)
        toast.error(`Failed to load media items: ${error.message}`)
        return
      }

      setMediaItems(data || [])
    } catch (error: any) {
      console.error("Unexpected error fetching media items:", error)
      toast.error("An unexpected error occurred while loading media items")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    // Find the highest display_order and add 1
    const highestOrder = mediaItems.length > 0 ? Math.max(...mediaItems.map((item) => item.display_order)) : 0

    setCurrentMedia({
      title: "",
      description: "",
      media_url: "",
      media_type: "image",
      is_active: true,
      display_order: highestOrder + 1,
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
      is_active: true,
      display_order: 0,
    })
    setMediaFile(null)
  }

  const handleDelete = async (id: number) => {
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
      if (media?.media_url && media.media_url.trim() !== "") {
        try {
          await deleteFromBannerImages(media.media_url)
        } catch (err: any) {
          // Just log the error but don't stop the process
          console.error("Error deleting media file:", err)
        }
      }

      toast.success("Media item deleted successfully")
      fetchMediaItems()
    } catch (error: any) {
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

      // Media URL is required for new items
      if (!currentMedia.id && !mediaFile && !currentMedia.media_url) {
        toast.error("Please select a media file")
        setIsSaving(false)
        return
      }

      let mediaUrl = currentMedia.media_url || ""

      // Upload media if a new one is selected
      if (mediaFile) {
        try {
          const uploadResult = await uploadToBannerImages(mediaFile)
          mediaUrl = uploadResult.url
        } catch (error: any) {
          console.error("Error uploading file:", error)
          toast.error(`Failed to upload file: ${error.message}`)
          setIsSaving(false)
          return
        }
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
            type: "carousel", // Add this line
            is_active: currentMedia.is_active,
            display_order: currentMedia.display_order,
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
          media_url: mediaUrl,
          media_type: currentMedia.media_type || "image",
          type: "carousel", // Add this line to set the type field
          is_active: currentMedia.is_active !== undefined ? currentMedia.is_active : true,
          display_order: currentMedia.display_order || 0,
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
        is_active: true,
        display_order: 0,
      })
      setMediaFile(null)
    } catch (error: any) {
      console.error("Unexpected error saving media item:", error)
      toast.error("An unexpected error occurred while saving the media item")
    } finally {
      setIsSaving(false)
    }
  }

  const handleMoveUp = async (item: MediaItem, index: number) => {
    if (index === 0) return // Already at the top

    try {
      const prevItem = mediaItems[index - 1]

      // Swap display orders
      const newOrder = prevItem.display_order
      const prevOrder = item.display_order

      // Update current item
      const { error: error1 } = await supabase
        .from("banner_media")
        .update({ display_order: newOrder })
        .eq("id", item.id)

      if (error1) {
        console.error("Error updating order:", error1)
        toast.error(`Failed to update order: ${error1.message}`)
        return
      }

      // Update previous item
      const { error: error2 } = await supabase
        .from("banner_media")
        .update({ display_order: prevOrder })
        .eq("id", prevItem.id)

      if (error2) {
        console.error("Error updating order:", error2)
        toast.error(`Failed to update order: ${error2.message}`)
        return
      }

      // Refresh the list
      fetchMediaItems()
      toast.success("Item moved up successfully")
    } catch (error: any) {
      console.error("Error moving item:", error)
      toast.error(`Failed to move item: ${error.message}`)
    }
  }

  const handleMoveDown = async (item: MediaItem, index: number) => {
    if (index === mediaItems.length - 1) return // Already at the bottom

    try {
      const nextItem = mediaItems[index + 1]

      // Swap display orders
      const newOrder = nextItem.display_order
      const nextOrder = item.display_order

      // Update current item
      const { error: error1 } = await supabase
        .from("banner_media")
        .update({ display_order: newOrder })
        .eq("id", item.id)

      if (error1) {
        console.error("Error updating order:", error1)
        toast.error(`Failed to update order: ${error1.message}`)
        return
      }

      // Update next item
      const { error: error2 } = await supabase
        .from("banner_media")
        .update({ display_order: nextOrder })
        .eq("id", nextItem.id)

      if (error2) {
        console.error("Error updating order:", error2)
        toast.error(`Failed to update order: ${error2.message}`)
        return
      }

      // Refresh the list
      fetchMediaItems()
      toast.success("Item moved down successfully")
    } catch (error: any) {
      console.error("Error moving item:", error)
      toast.error(`Failed to move item: ${error.message}`)
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
                Title
              </label>
              <Input
                id="title"
                value={currentMedia.title || ""}
                onChange={(e) => setCurrentMedia({ ...currentMedia, title: e.target.value })}
                placeholder="Enter media title"
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="media_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Media Type
                </label>
                <Select
                  value={currentMedia.media_type || "image"}
                  onValueChange={(value) =>
                    setCurrentMedia({ ...currentMedia, media_type: value as "video" | "image" })
                  }
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
                <label htmlFor="display_order" className="block text-sm font-medium text-gray-700 mb-1">
                  Display Order
                </label>
                <Input
                  id="display_order"
                  type="number"
                  min="0"
                  value={currentMedia.display_order || 0}
                  onChange={(e) => setCurrentMedia({ ...currentMedia, display_order: Number.parseInt(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={currentMedia.is_active}
                onCheckedChange={(checked) => setCurrentMedia({ ...currentMedia, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
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
              {mediaItems.map((mediaItem, index) => (
                <Card key={mediaItem.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      <div className="w-full md:w-1/3 h-48 bg-gray-100 relative">
                        {mediaItem.media_type === "video" ? (
                          <video src={mediaItem.media_url} className="w-full h-full object-cover" muted playsInline />
                        ) : (
                          <img
                            src={mediaItem.media_url || "/placeholder.svg"}
                            alt={mediaItem.title}
                            className="w-full h-full object-cover"
                          />
                        )}
                        <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 text-xs rounded">
                          Order: {mediaItem.display_order}
                        </div>
                        {!mediaItem.is_active && (
                          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs rounded">
                            Inactive
                          </div>
                        )}
                      </div>
                      <div className="p-4 flex-1">
                        <h3 className="text-xl font-semibold mb-2">{mediaItem.title}</h3>
                        <p className="text-gray-600 mb-4 line-clamp-2">{mediaItem.description}</p>
                        <div className="flex justify-between items-center mt-4">
                          <div className="flex space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveUp(mediaItem, index)}
                              disabled={index === 0}
                            >
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMoveDown(mediaItem, index)}
                              disabled={index === mediaItems.length - 1}
                            >
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="flex space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(mediaItem)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700 bg-transparent"
                              onClick={() => handleDelete(mediaItem.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
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
