"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, ArrowUp, ArrowDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"

interface GridImage {
  id: string
  image_url: string
  position: number
  title?: string
  description?: string
  created_at: string
  user_id: string
}

interface GridImageManagerProps {
  userId: string
}

export default function GridImageManager({ userId }: GridImageManagerProps) {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentImage, setCurrentImage] = useState<Partial<GridImage>>({
    image_url: "",
    position: 0,
    title: "",
    description: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [usePhotoGrid, setUsePhotoGrid] = useState(true)

  useEffect(() => {
    checkTables()
    fetchGridImages()
  }, [usePhotoGrid])

  const checkTables = async () => {
    try {
      // Check if photo_grid table exists
      const { error: photoGridError } = await supabase.from("photo_grid").select("id").limit(1).maybeSingle()

      if (photoGridError && photoGridError.message.includes("does not exist")) {
        // Fall back to grid_images
        setUsePhotoGrid(false)

        // Check if grid_images exists
        const { error: gridImagesError } = await supabase.from("grid_images").select("id").limit(1).maybeSingle()

        if (gridImagesError && gridImagesError.message.includes("does not exist")) {
          // Create grid_images table
          await createGridImagesTable()
        }
      } else {
        setUsePhotoGrid(true)
      }
    } catch (error) {
      console.error("Error checking tables:", error)
      setUsePhotoGrid(false)
    }
  }

  const fetchGridImages = async () => {
    try {
      setLoading(true)

      if (usePhotoGrid) {
        // Fetch from photo_grid table
        const { data, error } = await supabase.from("photo_grid").select("*").order("position", { ascending: true })

        if (error) throw error
        setImages(data || [])
      } else {
        // Fetch from grid_images table
        const { data, error } = await supabase.from("grid_images").select("*").order("position", { ascending: true })

        if (error) throw error

        // Map to match photo_grid structure
        const mappedData = (data || []).map((img) => ({
          ...img,
          title: undefined,
          description: undefined,
        }))

        setImages(mappedData)
      }
    } catch (error) {
      console.error(`Error fetching from ${usePhotoGrid ? "photo_grid" : "grid_images"}:`, error)
      toast.error("Failed to load grid images")
    } finally {
      setLoading(false)
    }
  }

  const createGridImagesTable = async () => {
    try {
      // Create the table using RPC
      const { error } = await supabase.rpc("create_grid_images_table")

      if (error && !error.message.includes("already exists")) {
        throw error
      }
    } catch (error) {
      console.error("Error creating grid_images table:", error)
    }
  }

  const handleCreateNew = () => {
    // Find the next available position
    const nextPosition = images.length > 0 ? Math.max(...images.map((img) => img.position)) + 1 : 0

    setCurrentImage({
      image_url: "",
      position: nextPosition,
      title: "",
      description: "",
    })
    setImageFile(null)
    setIsEditing(true)
  }

  const handleEdit = (image: GridImage) => {
    setCurrentImage(image)
    setImageFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentImage({
      image_url: "",
      position: 0,
      title: "",
      description: "",
    })
    setImageFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return

    try {
      const tableName = usePhotoGrid ? "photo_grid" : "grid_images"
      const bucketName = usePhotoGrid ? "photo-grid" : "grid-images"

      // First, get the image to check if it has an image URL
      const { data: image } = await supabase.from(tableName).select("image_url").eq("id", id).single()

      // Delete the image record
      const { error } = await supabase.from(tableName).delete().eq("id", id)

      if (error) throw error

      // If there was an image, delete it from storage
      if (image?.image_url) {
        const imagePath = image.image_url.split("/").pop()
        if (imagePath) {
          await supabase.storage.from(bucketName).remove([imagePath])
        }
      }

      toast.success("Image deleted successfully")
      fetchGridImages()
    } catch (error) {
      toast.error("Failed to delete image")
    }
  }

  const handleSave = async () => {
    try {
      if (!currentImage.position && currentImage.position !== 0) {
        toast.error("Position is required")
        return
      }

      let imageUrl = currentImage.image_url
      const tableName = usePhotoGrid ? "photo_grid" : "grid_images"
      const bucketName = usePhotoGrid ? "photo-grid" : "grid-images"

      // Upload image if a new one is selected
      if (imageFile) {
        setUploadProgress(0)
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        // Fix bucket permissions if using photo-grid
        if (usePhotoGrid) {
          try {
            await supabase.rpc("fix_photo_grid_bucket")
          } catch (error) {
            console.error("Error fixing photo-grid bucket:", error)
          }
        }

        const { error: uploadError, data } = await supabase.storage.from(bucketName).upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: urlData } = supabase.storage.from(bucketName).getPublicUrl(filePath)

        imageUrl = urlData.publicUrl
      }

      if (!imageUrl) {
        toast.error("Please upload an image")
        return
      }

      if (currentImage.id) {
        // Update existing image
        const updateData: any = {
          image_url: imageUrl,
          position: currentImage.position,
          updated_at: new Date().toISOString(),
        }

        // Add title and description if using photo_grid
        if (usePhotoGrid) {
          updateData.title = currentImage.title || null
          updateData.description = currentImage.description || null
        }

        const { error } = await supabase
          .from(tableName)
          .update(updateData)
          .eq("id", currentImage.id)
          .eq("user_id", userId)

        if (error) throw error
        toast.success("Image updated successfully")
      } else {
        // Create new image
        const insertData: any = {
          image_url: imageUrl,
          position: currentImage.position,
          user_id: userId,
        }

        // Add title and description if using photo_grid
        if (usePhotoGrid) {
          insertData.title = currentImage.title || null
          insertData.description = currentImage.description || null
        }

        const { error } = await supabase.from(tableName).insert(insertData)

        if (error) throw error
        toast.success("Image added successfully")
      }

      setIsEditing(false)
      fetchGridImages()
      setCurrentImage({
        image_url: "",
        position: 0,
        title: "",
        description: "",
      })
      setImageFile(null)
    } catch (error) {
      console.error("Error saving image:", error)
      toast.error("Failed to save image")
    }
  }

  const handleMoveUp = async (image: GridImage, index: number) => {
    if (index === 0) return // Already at the top

    try {
      const tableName = usePhotoGrid ? "photo_grid" : "grid_images"
      const prevImage = images[index - 1]

      // Swap positions
      await supabase.from(tableName).update({ position: prevImage.position }).eq("id", image.id)

      await supabase.from(tableName).update({ position: image.position }).eq("id", prevImage.id)

      fetchGridImages()
    } catch (error) {
      toast.error("Failed to reorder images")
    }
  }

  const handleMoveDown = async (image: GridImage, index: number) => {
    if (index === images.length - 1) return // Already at the bottom

    try {
      const tableName = usePhotoGrid ? "photo_grid" : "grid_images"
      const nextImage = images[index + 1]

      // Swap positions
      await supabase.from(tableName).update({ position: nextImage.position }).eq("id", image.id)

      await supabase.from(tableName).update({ position: image.position }).eq("id", nextImage.id)

      fetchGridImages()
    } catch (error) {
      toast.error("Failed to reorder images")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading grid images...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Homepage Grid Images</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]" disabled={images.length >= 4}>
            <PlusCircle className="mr-2 h-4 w-4" /> Add Image
          </Button>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Manage the 2x2 image grid displayed on the homepage. You can add up to 4 images.
          {images.length >= 4 && " You have reached the maximum number of images."}
        </p>
        <p className="text-sm text-gray-600 mt-1">
          Currently using: <span className="font-semibold">{usePhotoGrid ? "photo_grid" : "grid_images"}</span> table
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentImage.id ? "Edit Image" : "Add New Image"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Position (0-3)</label>
              <input
                type="number"
                min="0"
                max="3"
                value={currentImage.position}
                onChange={(e) => setCurrentImage({ ...currentImage, position: Number.parseInt(e.target.value) || 0 })}
                className="w-full p-2 border border-gray-300 rounded-md"
              />
              <p className="text-xs text-gray-500 mt-1">
                Position determines where the image appears in the grid (0-3).
              </p>
            </div>

            {usePhotoGrid && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title (Optional)</label>
                  <input
                    type="text"
                    value={currentImage.title || ""}
                    onChange={(e) => setCurrentImage({ ...currentImage, title: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Enter image title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                  <textarea
                    value={currentImage.description || ""}
                    onChange={(e) => setCurrentImage({ ...currentImage, description: e.target.value })}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="Enter image description"
                  />
                </div>
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
              <ImageUploader
                existingImageUrl={currentImage.image_url}
                onImageSelected={setImageFile}
                uploadProgress={uploadProgress}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Image
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {images.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No grid images yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Image
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {images.map((image, index) => (
                <Card key={image.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col">
                      <div className="w-full h-48 bg-gray-100 relative">
                        <img
                          src={image.image_url || "/placeholder.svg"}
                          alt={image.title || `Grid image ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-4 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm font-medium">Position: {image.position}</span>
                          <div className="flex flex-col">
                            <button
                              onClick={() => handleMoveUp(image, index)}
                              disabled={index === 0}
                              className={`p-1 ${index === 0 ? "text-gray-300" : "text-gray-600 hover:text-gray-900"}`}
                            >
                              <ArrowUp size={14} />
                            </button>
                            <button
                              onClick={() => handleMoveDown(image, index)}
                              disabled={index === images.length - 1}
                              className={`p-1 ${index === images.length - 1 ? "text-gray-300" : "text-gray-600 hover:text-gray-900"}`}
                            >
                              <ArrowDown size={14} />
                            </button>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(image)}>
                            <Edit className="h-4 w-4 mr-1" /> Edit
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-700"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-1" /> Delete
                          </Button>
                        </div>
                      </div>
                      {usePhotoGrid && image.title && (
                        <div className="px-4 pb-3">
                          <h3 className="font-medium">{image.title}</h3>
                          {image.description && <p className="text-sm text-gray-600 mt-1">{image.description}</p>}
                        </div>
                      )}
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
