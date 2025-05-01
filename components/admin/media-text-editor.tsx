"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { toast } from "sonner"
import { Trash2, Move, Save } from "lucide-react"
import Image from "next/image"

interface Media {
  id: string
  title: string
  description: string
  media_url: string
  media_type: "video" | "image"
  created_at: string
  text_overlay?: {
    content: string
    position: { x: number; y: number }
    style?: {
      fontSize: string
      color: string
      fontWeight: string
    }
  }
}

export default function MediaTextEditor() {
  const [mediaItems, setMediaItems] = useState<Media[]>([])
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [textContent, setTextContent] = useState("")
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 }) // Center by default
  const [fontSize, setFontSize] = useState(24)
  const [textColor, setTextColor] = useState("#ffffff") // White by default
  const [fontWeight, setFontWeight] = useState("bold")
  const [isDragging, setIsDragging] = useState(false)

  const previewRef = useRef<HTMLDivElement>(null)
  const textRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetchMediaItems()
  }, [])

  const fetchMediaItems = async () => {
    try {
      setLoading(true)

      // Try to fetch from banner_media table first
      const { data: mediaData, error: mediaError } = await supabase
        .from("banner_media")
        .select("*")
        .order("created_at", { ascending: false })

      if (!mediaError && mediaData && mediaData.length > 0) {
        setMediaItems(mediaData)
        if (!selectedMediaId && mediaData.length > 0) {
          setSelectedMediaId(mediaData[0].id)
          loadTextOverlay(mediaData[0])
        }
      } else {
        // Fall back to banner_videos table
        const { data: videoData, error: videoError } = await supabase
          .from("banner_videos")
          .select("*")
          .order("created_at", { ascending: false })

        if (!videoError && videoData && videoData.length > 0) {
          const convertedMedia = videoData.map((video) => ({
            id: video.id,
            title: video.title,
            description: video.description,
            media_url: video.video_url,
            media_type: "video" as const,
            created_at: video.created_at,
            text_overlay: video.text_overlay,
          }))

          setMediaItems(convertedMedia)
          if (!selectedMediaId && convertedMedia.length > 0) {
            setSelectedMediaId(convertedMedia[0].id)
            loadTextOverlay(convertedMedia[0])
          }
        } else {
          toast.error("No media items found. Please add media items first.")
        }
      }
    } catch (error) {
      toast.error("Failed to load media items")
      console.error("Error fetching media items:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadTextOverlay = (media: Media) => {
    if (media.text_overlay) {
      setTextContent(media.text_overlay.content)
      setTextPosition(media.text_overlay.position)

      if (media.text_overlay.style) {
        setFontSize(Number.parseInt(media.text_overlay.style.fontSize) || 24)
        setTextColor(media.text_overlay.style.color || "#ffffff")
        setFontWeight(media.text_overlay.style.fontWeight || "bold")
      } else {
        // Reset to defaults if no style
        setFontSize(24)
        setTextColor("#ffffff")
        setFontWeight("bold")
      }
    } else {
      // Reset all values if no text overlay
      setTextContent("")
      setTextPosition({ x: 50, y: 50 })
      setFontSize(24)
      setTextColor("#ffffff")
      setFontWeight("bold")
    }
  }

  const handleMediaChange = (mediaId: string) => {
    setSelectedMediaId(mediaId)
    const selectedMedia = mediaItems.find((media) => media.id === mediaId)
    if (selectedMedia) {
      loadTextOverlay(selectedMedia)
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!previewRef.current || !textRef.current) return

    // Only start dragging if clicking on the text element or its children
    if (textRef.current.contains(e.target as Node)) {
      setIsDragging(true)

      // Prevent text selection during drag
      e.preventDefault()
    }
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !previewRef.current) return

    const rect = previewRef.current.getBoundingClientRect()

    // Calculate position as percentage of container
    const x = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
    const y = Math.max(0, Math.min(100, ((e.clientY - rect.top) / rect.height) * 100))

    setTextPosition({ x, y })
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  const handleSave = async () => {
    if (!selectedMediaId) {
      toast.error("Please select a media item first")
      return
    }

    if (!textContent.trim()) {
      toast.error("Please enter some text content")
      return
    }

    try {
      setSaving(true)

      const selectedMedia = mediaItems.find((media) => media.id === selectedMediaId)
      if (!selectedMedia) {
        toast.error("Selected media not found")
        return
      }

      const textOverlay = {
        content: textContent,
        position: textPosition,
        style: {
          fontSize: `${fontSize}px`,
          color: textColor,
          fontWeight: fontWeight,
        },
      }

      // Determine which table to update based on media type
      const tableName =
        selectedMedia.media_type === "video" && !selectedMedia.media_url.includes("banner-images")
          ? "banner_videos"
          : "banner_media"

      const { error } = await supabase.from(tableName).update({ text_overlay: textOverlay }).eq("id", selectedMediaId)

      if (error) {
        throw error
      }

      toast.success("Text overlay saved successfully")

      // Update local state
      setMediaItems(
        mediaItems.map((media) => (media.id === selectedMediaId ? { ...media, text_overlay: textOverlay } : media)),
      )
    } catch (error) {
      console.error("Error saving text overlay:", error)
      toast.error("Failed to save text overlay")
    } finally {
      setSaving(false)
    }
  }

  const handleRemoveText = async () => {
    if (!selectedMediaId) {
      toast.error("Please select a media item first")
      return
    }

    try {
      setSaving(true)

      const selectedMedia = mediaItems.find((media) => media.id === selectedMediaId)
      if (!selectedMedia) {
        toast.error("Selected media not found")
        return
      }

      // Determine which table to update based on media type
      const tableName =
        selectedMedia.media_type === "video" && !selectedMedia.media_url.includes("banner-images")
          ? "banner_videos"
          : "banner_media"

      const { error } = await supabase.from(tableName).update({ text_overlay: null }).eq("id", selectedMediaId)

      if (error) {
        throw error
      }

      toast.success("Text overlay removed")

      // Update local state
      setMediaItems(
        mediaItems.map((media) => (media.id === selectedMediaId ? { ...media, text_overlay: undefined } : media)),
      )

      // Reset form
      setTextContent("")
      setTextPosition({ x: 50, y: 50 })
      setFontSize(24)
      setTextColor("#ffffff")
      setFontWeight("bold")
    } catch (error) {
      console.error("Error removing text overlay:", error)
      toast.error("Failed to remove text overlay")
    } finally {
      setSaving(false)
    }
  }

  const selectedMedia = mediaItems.find((media) => media.id === selectedMediaId)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Media Text Overlay Editor</h2>
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          Add and position text overlays on your media items. Drag the text to position it exactly where you want it to
          appear.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left column: Media selection and preview */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Media Selection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="media-select">Select Media Item</Label>
                  <Select
                    value={selectedMediaId || ""}
                    onValueChange={handleMediaChange}
                    disabled={loading || mediaItems.length === 0}
                  >
                    <SelectTrigger id="media-select">
                      <SelectValue placeholder="Select a media item" />
                    </SelectTrigger>
                    <SelectContent>
                      {mediaItems.map((media) => (
                        <SelectItem key={media.id} value={media.id}>
                          {media.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedMedia && (
                  <div
                    className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden"
                    ref={previewRef}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                  >
                    {selectedMedia.media_type === "video" ? (
                      <video
                        src={selectedMedia.media_url}
                        className="w-full h-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />
                    ) : (
                      <div className="w-full h-full relative">
                        <Image
                          src={selectedMedia.media_url || "/placeholder.svg"}
                          alt={selectedMedia.title}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Text overlay preview */}
                    {textContent && (
                      <div
                        ref={textRef}
                        className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-move ${isDragging ? "z-50" : "z-10"}`}
                        style={{
                          top: `${textPosition.y}%`,
                          left: `${textPosition.x}%`,
                          fontSize: `${fontSize}px`,
                          color: textColor,
                          fontWeight: fontWeight,
                          textShadow: "0 2px 4px rgba(0,0,0,0.5)",
                          userSelect: "none",
                        }}
                      >
                        {textContent}
                        {isDragging && (
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-black/70 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                            <Move className="h-3 w-3 inline mr-1" /> Dragging
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {!selectedMedia && !loading && (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <p className="text-gray-500">No media selected</p>
                  </div>
                )}

                {loading && (
                  <div className="flex items-center justify-center h-48 bg-gray-100 rounded-lg">
                    <div className="animate-spin h-8 w-8 border-4 border-[#ffd6c0] border-t-transparent rounded-full"></div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column: Text editor */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Text Overlay</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content">Text Content</Label>
                  <Input
                    id="text-content"
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    placeholder="Enter text to display"
                    disabled={!selectedMediaId || loading}
                  />
                </div>

                <div>
                  <Label htmlFor="font-size" className="flex justify-between">
                    <span>Font Size: {fontSize}px</span>
                  </Label>
                  <Slider
                    id="font-size"
                    min={12}
                    max={72}
                    step={1}
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    disabled={!selectedMediaId || loading}
                    className="my-2"
                  />
                </div>

                <div>
                  <Label htmlFor="text-color">Text Color</Label>
                  <div className="flex items-center space-x-2">
                    <div
                      className="w-8 h-8 rounded-full border border-gray-300"
                      style={{ backgroundColor: textColor }}
                    ></div>
                    <Input
                      id="text-color"
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      disabled={!selectedMediaId || loading}
                      className="w-full h-10"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="font-weight">Font Weight</Label>
                  <Select value={fontWeight} onValueChange={setFontWeight} disabled={!selectedMediaId || loading}>
                    <SelectTrigger id="font-weight">
                      <SelectValue placeholder="Select font weight" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="semibold">Semibold</SelectItem>
                      <SelectItem value="bold">Bold</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="pt-4 flex space-x-2">
                  <Button
                    onClick={handleSave}
                    className="flex-1 bg-[#ffd6c0] hover:bg-[#ffcbb0]"
                    disabled={!selectedMediaId || loading || saving || !textContent.trim()}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {saving ? "Saving..." : "Save Text Overlay"}
                  </Button>

                  <Button
                    onClick={handleRemoveText}
                    variant="outline"
                    className="text-red-500"
                    disabled={!selectedMediaId || loading || saving || !textContent.trim()}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Remove
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
