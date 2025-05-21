"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { uploadToBannerImages, deleteFromBannerImages } from "@/utils/supabase-storage"
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd"

type VerticalCarouselItem = {
  id: string
  image_url: string
  title?: string
  description?: string
  link_url?: string
  link_text?: string
  position: number
}

export default function VerticalCarouselManager() {
  const [items, setItems] = useState<VerticalCarouselItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [uploading, setUploading] = useState(false)
  const [newItem, setNewItem] = useState<Partial<VerticalCarouselItem>>({
    title: "",
    description: "",
    link_url: "",
    link_text: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/vertical-carousel")
      if (!response.ok) {
        throw new Error("Failed to fetch vertical carousel items")
      }
      const data = await response.json()
      setItems(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewItem((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setUploading(true)
      setError(null)
      setSuccess(null)

      if (!imageFile && !editingId) {
        setError("Please select an image")
        return
      }

      let imageUrl = editingId ? items.find((item) => item.id === editingId)?.image_url : ""

      // Upload image if there's a new file
      if (imageFile) {
        const uploadResult = await uploadToBannerImages(imageFile)
        imageUrl = uploadResult.url
      }

      const itemData = {
        ...newItem,
        image_url: imageUrl,
        position: editingId ? items.find((item) => item.id === editingId)?.position : items.length,
      }

      let response
      if (editingId) {
        response = await fetch("/api/vertical-carousel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingId, ...itemData }),
        })
      } else {
        response = await fetch("/api/vertical-carousel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(itemData),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save carousel item")
      }

      setSuccess(editingId ? "Item updated successfully" : "Item added successfully")
      setNewItem({
        title: "",
        description: "",
        link_url: "",
        link_text: "",
      })
      setImageFile(null)
      setEditingId(null)
      fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setUploading(false)
    }
  }

  const handleEdit = (item: VerticalCarouselItem) => {
    setEditingId(item.id)
    setNewItem({
      title: item.title || "",
      description: item.description || "",
      link_url: item.link_url || "",
      link_text: item.link_text || "",
    })
  }

  const handleDelete = async (id: string, imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return

    try {
      setLoading(true)
      setError(null)
      setSuccess(null)

      // Delete from database
      const response = await fetch(`/api/vertical-carousel?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete carousel item")
      }

      // Try to delete the image
      try {
        if (imageUrl) {
          await deleteFromBannerImages(imageUrl)
        }
      } catch (imageError) {
        console.error("Error deleting image:", imageError)
        // Continue even if image deletion fails
      }

      setSuccess("Item deleted successfully")
      fetchItems()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setNewItem({
      title: "",
      description: "",
      link_url: "",
      link_text: "",
    })
    setImageFile(null)
  }

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const reorderedItems = Array.from(items)
    const [removed] = reorderedItems.splice(result.source.index, 1)
    reorderedItems.splice(result.destination.index, 0, removed)

    // Update positions
    const updatedItems = reorderedItems.map((item, index) => ({
      ...item,
      position: index,
    }))

    setItems(updatedItems)

    // Update positions in database
    try {
      setLoading(true)
      for (const item of updatedItems) {
        await fetch("/api/vertical-carousel", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: item.id, position: item.position }),
        })
      }
      setSuccess("Order updated successfully")
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      fetchItems() // Revert to original order on error
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Vertical Carousel Manager</h2>
      <p className="text-gray-600">
        Manage the vertical carousel images that appear on the homepage. These should be tall, vertical images.
      </p>

      {error && <div className="p-3 bg-red-100 text-red-700 rounded-md">{error}</div>}
      {success && <div className="p-3 bg-green-100 text-green-700 rounded-md">{success}</div>}

      <form onSubmit={handleSubmit} className="space-y-4 border p-4 rounded-md">
        <h3 className="text-lg font-medium">{editingId ? "Edit Carousel Item" : "Add New Carousel Item"}</h3>

        <div className="space-y-2">
          <Label htmlFor="image">Image (Recommended size: 400px × 600px)</Label>
          <Input id="image" type="file" accept="image/*" onChange={handleImageChange} />
          {editingId && !imageFile && <p className="text-sm text-gray-500">Leave empty to keep the current image</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Title (Optional)</Label>
          <Input
            id="title"
            name="title"
            value={newItem.title || ""}
            onChange={handleInputChange}
            placeholder="Enter title"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            name="description"
            value={newItem.description || ""}
            onChange={handleInputChange}
            placeholder="Enter description"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_url">Link URL (Optional)</Label>
          <Input
            id="link_url"
            name="link_url"
            value={newItem.link_url || ""}
            onChange={handleInputChange}
            placeholder="https://example.com"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="link_text">Link Text (Optional)</Label>
          <Input
            id="link_text"
            name="link_text"
            value={newItem.link_text || ""}
            onChange={handleInputChange}
            placeholder="Learn More"
          />
        </div>

        <div className="flex gap-2">
          <Button type="submit" disabled={uploading}>
            {uploading ? "Saving..." : editingId ? "Update Item" : "Add Item"}
          </Button>
          {editingId && (
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
          )}
        </div>
      </form>

      <div className="border p-4 rounded-md">
        <h3 className="text-lg font-medium mb-4">Current Carousel Items</h3>
        {loading ? (
          <p>Loading...</p>
        ) : items.length === 0 ? (
          <p>No items added yet.</p>
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="vertical-carousel-items">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {items.map((item, index) => (
                    <Draggable key={item.id} draggableId={item.id} index={index}>
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="flex items-center gap-4 p-3 bg-gray-50 rounded-md"
                        >
                          <div className="w-16 h-24 bg-gray-200 rounded overflow-hidden flex-shrink-0">
                            {item.image_url && (
                              <img
                                src={item.image_url || "/placeholder.svg"}
                                alt={item.title || "Carousel image"}
                                className="w-full h-full object-cover"
                              />
                            )}
                          </div>
                          <div className="flex-grow">
                            <h4 className="font-medium">{item.title || "Untitled"}</h4>
                            {item.description && (
                              <p className="text-sm text-gray-600 line-clamp-2">{item.description}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button type="button" variant="outline" size="sm" onClick={() => handleEdit(item)}>
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(item.id, item.image_url)}
                            >
                              Delete
                            </Button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        )}
      </div>
    </div>
  )
}
