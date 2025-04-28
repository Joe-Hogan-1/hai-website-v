"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, ImageIcon, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Media {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  position: number
  created_at: string
  user_id: string
}

interface MediaManagerProps {
  userId: string
}

export default function MediaManager({ userId }: MediaManagerProps) {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentMedia, setCurrentMedia] = useState<Partial<Media>>({
    title: "",
    description: "",
    media_url: "",
    media_type: "video",
    position: 0,
  })
  const [mediaFile, setMediaFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchMedia()
  }, [])

  // Replace the existing fetchMedia function with this improved version:
  const fetchMedia = async () => {
    try {
      setLoading(true)
      console.log("Fetching media items...")

      // Try to fetch from banner_media table
      const { data, error } = await supabase
        .from("banner_media")
        .select("*")
        .order("position, created_at", { ascending: true })

      if (error) {
        console.log("Error fetching media:", error.message)

        // If the table doesn't exist, try to create it
        if (error.message.includes("does not exist")) {
          console.log("Table doesn't exist, attempting to create it")
          const tableCreated = await createMediaTable()

          if (tableCreated) {
            console.log("Table created, attempting to migrate videos")
            // After creating the table, try to migrate existing videos
            await migrateVideosToMedia()

            // Fetch again after migration
            console.log("Fetching media after migration")
            const { data: newData, error: newError } = await supabase
              .from("banner_media")
              .select("*")
              .order("position, created_at", { ascending: true })

            if (newError) {
              console.error("Error fetching after migration:", newError)
              toast.error("Error fetching media after migration")
              setMediaItems([])
            } else {
              console.log(`Fetched ${newData?.length || 0} media items after migration`)
              setMediaItems(newData || [])
            }
          } else {
            console.log("Table creation failed, using empty media list")
            // If table creation failed, just show an empty list and let the user add items manually
            setMediaItems([])
            toast.info("Media table not available. You can still add new media items.")
          }
        } else {
          toast.error(`Error fetching media: ${error.message}`)
          setMediaItems([])
        }
      } else {
        console.log(`Fetched ${data?.length || 0} media items`)
        setMediaItems(data || [])
      }
    } catch (error) {
      console.error("Exception in fetchMedia:", error)
      toast.error("Failed to load media items")
      setMediaItems([])
    } finally {
      setLoading(false)
    }
  }

  // Replace the createMediaTable function with this improved version:

  const createMediaTable = async () => {
    try {
      console.log("Attempting to create banner_media table")

      // First check if the table already exists
      const { error: checkError } = await supabase.from("banner_media").select("id").limit(1)

      if (!checkError) {
        console.log("Table already exists")
        return true
      }

      console.log("Table doesn't exist, attempting to create it manually")

      // Instead of trying to create the table with an insert, let's use a more direct approach
      // We'll create a simple structure with the minimum required fields
      try {
        // First, check if we can access the storage bucket (to verify permissions)
        const { data: bucketData, error: bucketError } = await supabase.storage.getBucket("banner-videos")

        if (bucketError) {
          console.log("Storage bucket check failed:", bucketError.message)
        } else {
          console.log("Storage bucket access verified")
        }

        // Try a simple insert with explicit ID to create the table
        const { error: insertError } = await supabase.from("banner_media").insert([
          {
            id: crypto.randomUUID(), // Generate a UUID for the ID
            title: "Table Creation Test",
            description: "This record was created to initialize the table",
            media_url: "",
            media_type: "image",
            position: 0,
            user_id: userId,
          },
        ])

        if (insertError) {
          console.error("Error creating table via insert:", insertError)

          // If the insert failed, let's try a different approach - create a fallback structure
          // This is a workaround for when the table doesn't exist yet
          const fallbackMedia = []
          setMediaItems(fallbackMedia)

          // Notify the user about the issue
          toast.error(`Could not create media table: ${insertError.message}`)
          return false
        }

        console.log("Table created successfully via insert method")
        return true
      } catch (insertCatchError) {
        console.error("Exception during table creation:", insertCatchError)

        // Provide a more detailed error message
        if (insertCatchError instanceof Error) {
          toast.error(`Table creation failed: ${insertCatchError.message}`)
        } else {
          toast.error("Table creation failed with an unknown error")
        }

        return false
      }
    } catch (error) {
      console.error("Error in createMediaTable:", error)

      if (error instanceof Error) {
        toast.error(`Failed to create media table: ${error.message}`)
      } else {
        toast.error("Failed to create media table with an unknown error")
      }

      return false
    }
  }

  const migrateVideosToMedia = async () => {
    try {
      // Check if banner_videos table exists
      const { data: videoData, error: videoError } = await supabase.from("banner_videos").select("*")

      if (videoError) {
        console.log("No videos to migrate:", videoError.message)
        return
      }

      // If we have videos, migrate them to the new table
      if (videoData && videoData.length > 0) {
        console.log(`Found ${videoData.length} videos to migrate`)

        // Process videos one by one to avoid batch insert issues
        for (const video of videoData) {
          try {
            const mediaItem = {
              title: video.title || "Untitled Video",
              description: video.description || "",
              media_url: video.video_url || "",
              media_type: "video",
              position: video.position || 0,
              user_id: video.user_id || userId,
            }

            // Insert each video individually
            const { error: insertError } = await supabase.from("banner_media").insert(mediaItem)

            if (insertError) {
              console.error(`Error migrating video ${video.id}:`, insertError)
            }
          } catch (itemError) {
            console.error(`Error processing video ${video.id}:`, itemError)
          }
        }

        toast.success("Successfully migrated existing videos")
      } else {
        console.log("No videos found to migrate")
      }
    } catch (error) {
      console.error("Error during migration:", error)
      toast.error("Error migrating videos. See console for details.")
    }
  }

  const handleCreateNew = () => {
    setCurrentMedia({
      title: "",
      description: "",
      media_url: "",
      media_type: "video",
      position: 0, // Default to first position
    })
    setMediaFile(null)
    setIsEditing(true)
  }

  const handleEdit = (media: Media) => {
    setCurrentMedia(media)
    setMediaFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentMedia({
      title: "",
      description: "",
      media_url: "",
      media_type: "video",
      position: 0,
    })
    setMediaFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this media item?")) return

    try {
      // First, get the media to check if it has a file
      const { data: media } = await supabase.from("banner_media").select("media_url, media_type").eq("id", id).single()

      // Delete the media record
      const { error } = await supabase.from("banner_media").delete().eq("id", id)

      if (error) throw error

      // If there was a file, delete it from storage
      if (media?.media_url) {
        const mediaPath = media.media_url.split("/").pop()
        if (mediaPath) {
          const bucket = media.media_type === "video" ? "banner-videos" : "banner-images"
          await supabase.storage.from(bucket).remove([mediaPath])
        }
      }

      toast.success("Media deleted successfully")
      fetchMedia()
    } catch (error) {
      toast.error("Failed to delete media")
    }
  }

  const handleMediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 100MB for videos, 10MB for images)
      const maxSize = currentMedia.media_type === "video" ? 100 * 1024 * 1024 : 10 * 1024 * 1024
      if (file.size > maxSize) {
        toast.error(`File is too large. Maximum size is ${currentMedia.media_type === "video" ? "100MB" : "10MB"}.`)
        return
      }

      // Check file type
      if (currentMedia.media_type === "video" && !file.type.startsWith("video/")) {
        toast.error("Selected file is not a video.")
        return
      }

      if (currentMedia.media_type === "image" && !file.type.startsWith("image/")) {
        toast.error("Selected file is not an image.")
        return
      }

      setMediaFile(file)
    }
  }

  // Find the handleSave function and replace it with this improved version:

  const handleSave = async () => {
    try {
      if (!currentMedia.title) {
        toast.error("Title is required")
        return
      }

      let mediaUrl = currentMedia.media_url

      // Upload file if a new one is selected
      if (mediaFile) {
        setUploadProgress(0)
        const fileExt = mediaFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`
        const bucket = currentMedia.media_type === "video" ? "banner-videos" : "banner-images"

        console.log(`Uploading to ${bucket}/${filePath}`)

        try {
          // Use the direct upload method instead of signed URLs
          const { error: uploadError, data } = await supabase.storage.from(bucket).upload(filePath, mediaFile, {
            cacheControl: "3600",
            upsert: false,
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100)
            },
          })

          if (uploadError) {
            console.error("Upload error:", uploadError)
            toast.error(`Upload failed: ${uploadError.message}`)
            return
          }

          console.log("Upload successful:", data)

          // Get the public URL
          const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(filePath)

          if (!urlData || !urlData.publicUrl) {
            throw new Error("Failed to get public URL after upload")
          }

          mediaUrl = urlData.publicUrl
          console.log("Public URL:", mediaUrl)
        } catch (uploadError) {
          console.error("Upload error:", uploadError)
          toast.error(`Upload failed: ${uploadError instanceof Error ? uploadError.message : "Unknown error"}`)
          return
        }
      }

      console.log("Saving media with URL:", mediaUrl)

      // Create a unique ID for new media items
      const mediaId = currentMedia.id || crypto.randomUUID()

      if (currentMedia.id) {
        // Update existing media
        console.log("Updating existing media:", currentMedia.id)
        const { error } = await supabase
          .from("banner_media")
          .update({
            title: currentMedia.title,
            description: currentMedia.description,
            media_url: mediaUrl,
            media_type: currentMedia.media_type,
            position: currentMedia.position,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentMedia.id)

        if (error) {
          console.error("Update error:", error)
          toast.error(`Update failed: ${error.message}`)
          return
        }

        toast.success("Media updated successfully")
      } else {
        // Create new media
        console.log("Creating new media with ID:", mediaId)
        const newMedia = {
          id: mediaId,
          title: currentMedia.title,
          description: currentMedia.description,
          media_url: mediaUrl,
          media_type: currentMedia.media_type,
          position: currentMedia.position,
          user_id: userId,
        }

        console.log("New media data:", newMedia)

        const { error, data } = await supabase.from("banner_media").insert(newMedia)

        if (error) {
          console.error("Insert error:", error)
          toast.error(`Insert failed: ${error.message}`)
          return
        }

        console.log("Insert successful:", data)
        toast.success("Media created successfully")
      }

      setIsEditing(false)
      fetchMedia()
      setCurrentMedia({
        title: "",
        description: "",
        media_url: "",
        media_type: "video",
        position: 0,
      })
      setMediaFile(null)
    } catch (error) {
      console.error("Save exception:", error)
      toast.error(`Save failed: ${error instanceof Error ? error.message : "Unknown error"}`)
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading media...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Scrolling Media Banner</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Media
          </Button>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          You can add multiple videos or images for each position that will appear between sections on the homepage.
          Each media item is assigned a position (0, 1, or 2) that determines where it appears:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
          <li>Position 0: After the welcome section</li>
          <li>Position 1: After the products section</li>
          <li>Position 2: After the blog section</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          You can add multiple media items to each position to create a more dynamic scrolling effect.
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentMedia.id ? "Edit Media" : "Create New Media"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                Position
              </label>
              <Select
                value={currentMedia.position?.toString()}
                onValueChange={(value) => setCurrentMedia({ ...currentMedia, position: Number.parseInt(value) })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select position" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Position 0 - After Welcome Section</SelectItem>
                  <SelectItem value="1">Position 1 - After Products Section</SelectItem>
                  <SelectItem value="2">Position 2 - After Blog Section</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label htmlFor="mediaType" className="block text-sm font-medium text-gray-700 mb-1">
                Media Type
              </label>
              <Select
                value={currentMedia.media_type}
                onValueChange={(value: "video" | "image") => setCurrentMedia({ ...currentMedia, media_type: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select media type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>

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

            <div>
              <label htmlFor="media" className="block text-sm font-medium text-gray-700 mb-1">
                {currentMedia.media_type === "video" ? "Video File" : "Image File"}
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
                {currentMedia.media_type === "video" ? "MP4, WebM, or Ogg. Max 100MB." : "JPG, PNG, or GIF. Max 10MB."}
              </p>
              {currentMedia.media_url && !mediaFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">
                    Current {currentMedia.media_type}: {currentMedia.media_url.split("/").pop()}
                  </p>
                  {currentMedia.media_type === "image" && (
                    <img
                      src={currentMedia.media_url || "/placeholder.svg"}
                      alt="Preview"
                      className="mt-2 max-h-40 rounded border"
                    />
                  )}
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
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Media
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
              {/* Group media by position */}
              {[0, 1, 2].map((position) => {
                const positionMedia = mediaItems.filter((m) => m.position === position)
                if (positionMedia.length === 0) return null

                return (
                  <div key={`position-${position}`} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">
                      Position {position} -{" "}
                      {position === 0 ? "After Welcome" : position === 1 ? "After Products" : "After Blog"}
                      <span className="text-sm text-gray-500 ml-2">
                        ({positionMedia.length} item{positionMedia.length !== 1 ? "s" : ""})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {positionMedia.map((media) => (
                        <Card key={media.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col">
                              <div className="w-full h-48 bg-gray-100 relative">
                                {media.media_type === "video" ? (
                                  media.media_url ? (
                                    <video
                                      src={media.media_url}
                                      className="w-full h-full object-cover"
                                      muted
                                      playsInline
                                    />
                                  ) : (
                                    <div className="flex items-center justify-center h-full">
                                      <Video className="h-12 w-12 text-gray-400" />
                                    </div>
                                  )
                                ) : media.media_url ? (
                                  <img
                                    src={media.media_url || "/placeholder.svg"}
                                    alt={media.title}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <ImageIcon className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                                  {media.media_type === "video" ? "Video" : "Image"}
                                </div>
                              </div>
                              <div className="p-4 flex-1">
                                <h3 className="text-xl font-semibold mb-2">{media.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{media.description}</p>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(media)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(media.id)}
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
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}
    </div>
  )
}
