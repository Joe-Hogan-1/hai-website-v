"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@supabase/supabase-js"
import Image from "next/image"
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core"
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { uploadToSecondaryGridImages } from "@/utils/supabase-storage"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface GridImage {
  id: string
  url: string
  alt: string
  position: number
}

function SortableItem({ image }: { image: GridImage }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: image.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="flex items-center gap-4 p-4 bg-white border rounded-md shadow-sm mb-2 cursor-move"
    >
      <div className="relative w-16 h-16 flex-shrink-0">
        <Image
          src={image.url || "/placeholder.svg"}
          alt={image.alt || "Grid image"}
          fill
          className="object-cover rounded-md"
        />
      </div>
      <div className="flex-grow">
        <p className="font-medium truncate">{image.alt || "No description"}</p>
        <p className="text-sm text-gray-500 truncate">{image.url}</p>
      </div>
    </div>
  )
}

export default function SecondaryGridManager() {
  const [images, setImages] = useState<GridImage[]>([])
  const [loading, setLoading] = useState(true)
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newImageAlt, setNewImageAlt] = useState("")
  const [uploading, setUploading] = useState(false)
  const [message, setMessage] = useState("")
  const [uploadProgress, setUploadProgress] = useState(0)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  )

  useEffect(() => {
    fetchImages()
  }, [])

  async function fetchImages() {
    setLoading(true)
    try {
      const { data, error } = await supabase.from("secondary_grid").select("*").order("position", { ascending: true })

      if (error) {
        console.error("Error fetching images:", error)
        return
      }

      if (data) {
        setImages(data)
      }
    } catch (error) {
      console.error("Error in fetchImages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleAddImage() {
    if (!newImageUrl) {
      setMessage("Please enter an image URL")
      return
    }

    // Check if we already have 2 images
    if (images.length >= 2) {
      setMessage("You can only have 2 images. Please delete an existing image first.")
      return
    }

    setUploading(true)
    setMessage("")

    try {
      const position = images.length > 0 ? Math.max(...images.map((img) => img.position)) + 1 : 1

      const response = await fetch("/api/secondary-grid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: newImageUrl,
          alt: newImageAlt,
          position,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add image")
      }

      setNewImageUrl("")
      setNewImageAlt("")
      setMessage("Image added successfully!")
      fetchImages()
    } catch (error) {
      console.error("Error adding image:", error)
      setMessage("Error adding image. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    // Check if we already have 2 images
    if (images.length >= 2) {
      setMessage("You can only have 2 images. Please delete an existing image first.")
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
      return
    }

    setUploading(true)
    setMessage("")
    setUploadProgress(0)

    try {
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          const newProgress = prev + 10
          if (newProgress >= 90) {
            clearInterval(progressInterval)
            return 90
          }
          return newProgress
        })
      }, 300)

      // Upload file to Supabase storage
      const result = await uploadToSecondaryGridImages(file)
      clearInterval(progressInterval)
      setUploadProgress(100)

      // Add the image to the grid
      const position = images.length > 0 ? Math.max(...images.map((img) => img.position)) + 1 : 1
      const response = await fetch("/api/secondary-grid", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          url: result.url,
          alt: file.name,
          position,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to add image")
      }

      setMessage("Image uploaded successfully!")
      fetchImages()

      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    } catch (error) {
      console.error("Error uploading image:", error)
      setMessage("Error uploading image. Please try again.")
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  async function handleDeleteImage(id: string) {
    try {
      const response = await fetch(`/api/secondary-grid?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete image")
      }

      setMessage("Image deleted successfully!")
      fetchImages()
    } catch (error) {
      console.error("Error deleting image:", error)
      setMessage("Error deleting image. Please try again.")
    }
  }

  async function handleDragEnd(event: any) {
    const { active, over } = event

    if (active.id !== over.id) {
      setImages((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over.id)

        const newArray = arrayMove(items, oldIndex, newIndex)

        // Update positions
        const updatedArray = newArray.map((item, index) => ({
          ...item,
          position: index + 1,
        }))

        // Update positions in database
        updatedArray.forEach(async (item) => {
          await fetch("/api/secondary-grid", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              id: item.id,
              url: item.url,
              alt: item.alt,
              position: item.position,
            }),
          })
        })

        return updatedArray
      })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Secondary Photo Grid (Bottom)</h2>
      <p className="text-gray-500">
        Manage the images that appear in the secondary photo grid below the vertical image carousel. These images will
        link to the Lifestyle page.
      </p>

      {images.length >= 2 && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You already have 2 images. Please delete an existing image before adding a new one.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
          <h3 className="text-lg font-medium mb-2">Upload New Image</h3>
          <p className="text-sm text-gray-500 mb-4">Upload an image from your device (maximum 2 images)</p>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
            id="file-upload"
            disabled={uploading || images.length >= 2}
          />

          <label
            htmlFor="file-upload"
            className={`inline-flex items-center px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 cursor-pointer ${
              uploading || images.length >= 2 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {uploading ? "Uploading..." : "Choose File"}
          </label>

          {uploadProgress > 0 && (
            <div className="w-full mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-black h-2.5 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 mt-1">{uploadProgress}% uploaded</p>
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 pt-4 mt-4">
          <h3 className="text-lg font-medium mb-2">Or Add Image by URL</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                Image URL
              </label>
              <input
                id="imageUrl"
                type="text"
                value={newImageUrl}
                onChange={(e) => setNewImageUrl(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter image URL"
                disabled={images.length >= 2}
              />
            </div>
            <div>
              <label htmlFor="imageAlt" className="block text-sm font-medium text-gray-700 mb-1">
                Image Description
              </label>
              <input
                id="imageAlt"
                type="text"
                value={newImageAlt}
                onChange={(e) => setNewImageAlt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter image description"
                disabled={images.length >= 2}
              />
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <button
              onClick={handleAddImage}
              disabled={uploading || !newImageUrl || images.length >= 2}
              className={`px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 ${
                uploading || !newImageUrl || images.length >= 2 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {uploading ? "Adding..." : "Add Image by URL"}
            </button>

            {message && (
              <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-4">Current Images</h3>
        <p className="text-sm text-gray-500 mb-4">
          Drag and drop to reorder images. The grid will display up to 2 images that link to the Lifestyle page.
        </p>

        {loading ? (
          <div className="space-y-2 animate-pulse">
            <div className="h-16 bg-gray-200 rounded"></div>
            <div className="h-16 bg-gray-200 rounded"></div>
          </div>
        ) : images.length === 0 ? (
          <p className="text-gray-500">No images added yet.</p>
        ) : (
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={images.map((img) => img.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {images.map((image) => (
                  <div key={image.id} className="flex items-center">
                    <SortableItem image={image} />
                    <button
                      onClick={() => handleDeleteImage(image.id)}
                      className="ml-2 p-2 text-red-500 hover:text-red-700 focus:outline-none"
                      aria-label="Delete image"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="border p-6 rounded-md">
          <div className="flex flex-col gap-2">
            {images.slice(0, 2).map((image) => (
              <div key={image.id} className="relative aspect-[16/9] overflow-hidden rounded-md">
                <Image
                  src={image.url || "/placeholder.svg"}
                  alt={image.alt || "Grid image"}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-contain"
                />
                <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-10 transition-all">
                  <span className="text-transparent hover:text-white font-medium">Links to Lifestyle Page</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
