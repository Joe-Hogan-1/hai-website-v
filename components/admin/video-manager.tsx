"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, Video } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface BannerVideo {
  id: string
  title: string
  description: string
  video_url: string
  position: number
  created_at: string
  user_id: string
}

interface VideoManagerProps {
  userId: string
}

export default function VideoManager({ userId }: VideoManagerProps) {
  const [videos, setVideos] = useState<BannerVideo[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentVideo, setCurrentVideo] = useState<Partial<BannerVideo>>({
    title: "",
    description: "",
    video_url: "",
    position: 0,
  })
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchVideos()
  }, [])

  const fetchVideos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("banner_videos")
        .select("*")
        .order("position, created_at", { ascending: true })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      toast.error("Failed to load videos")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentVideo({
      title: "",
      description: "",
      video_url: "",
      position: 0, // Default to first position
    })
    setVideoFile(null)
    setIsEditing(true)
  }

  const handleEdit = (video: BannerVideo) => {
    setCurrentVideo(video)
    setVideoFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentVideo({
      title: "",
      description: "",
      video_url: "",
      position: 0,
    })
    setVideoFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this video?")) return

    try {
      // First, get the video to check if it has a video file
      const { data: video } = await supabase.from("banner_videos").select("video_url").eq("id", id).single()

      // Delete the video record
      const { error } = await supabase.from("banner_videos").delete().eq("id", id)

      if (error) throw error

      // If there was a video file, delete it from storage
      if (video?.video_url) {
        const videoPath = video.video_url.split("/").pop()
        if (videoPath) {
          await supabase.storage.from("banner-videos").remove([videoPath])
        }
      }

      toast.success("Video deleted successfully")
      fetchVideos()
    } catch (error) {
      toast.error("Failed to delete video")
    }
  }

  const handleVideoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file size (limit to 100MB)
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Video file is too large. Maximum size is 100MB.")
        return
      }

      // Check file type
      if (!file.type.startsWith("video/")) {
        toast.error("Selected file is not a video.")
        return
      }

      setVideoFile(file)
    }
  }

  const handleSave = async () => {
    try {
      if (!currentVideo.title) {
        toast.error("Title is required")
        return
      }

      let videoUrl = currentVideo.video_url

      // Upload video if a new one is selected
      if (videoFile) {
        setUploadProgress(0)
        const fileExt = videoFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("banner-videos").upload(filePath, videoFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: urlData } = supabase.storage.from("banner-videos").getPublicUrl(filePath)

        videoUrl = urlData.publicUrl
      }

      if (currentVideo.id) {
        // Update existing video
        const { error } = await supabase
          .from("banner_videos")
          .update({
            title: currentVideo.title,
            description: currentVideo.description,
            video_url: videoUrl,
            position: currentVideo.position,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentVideo.id)
          .eq("user_id", userId) // Ensure user can only update their own videos

        if (error) throw error
        toast.success("Video updated successfully")
      } else {
        // Create new video
        const { error } = await supabase.from("banner_videos").insert({
          title: currentVideo.title,
          description: currentVideo.description,
          video_url: videoUrl,
          position: currentVideo.position,
          user_id: userId,
        })

        if (error) throw error
        toast.success("Video created successfully")
      }

      setIsEditing(false)
      fetchVideos()
      setCurrentVideo({
        title: "",
        description: "",
        video_url: "",
        position: 0,
      })
      setVideoFile(null)
    } catch (error) {
      toast.error("Failed to save video")
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading videos...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Banner Videos</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Video
          </Button>
        )}
      </div>

      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          You can add multiple videos for each position that will appear between sections on the homepage. Each video is
          assigned a position (0, 1, or 2) that determines where it appears:
        </p>
        <ul className="list-disc list-inside mt-2 text-sm text-gray-600">
          <li>Position 0: After the welcome section</li>
          <li>Position 1: After the products section</li>
          <li>Position 2: After the blog section</li>
        </ul>
        <p className="text-sm text-gray-600 mt-2">
          You can add multiple videos to each position to create a more dynamic river effect.
        </p>
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentVideo.id ? "Edit Video" : "Create New Video"}</h3>
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
                value={currentVideo.position?.toString()}
                onValueChange={(value) => setCurrentVideo({ ...currentVideo, position: Number.parseInt(value) })}
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
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <Input
                id="title"
                value={currentVideo.title || ""}
                onChange={(e) => setCurrentVideo({ ...currentVideo, title: e.target.value })}
                placeholder="Enter video title"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={currentVideo.description || ""}
                onChange={(e) => setCurrentVideo({ ...currentVideo, description: e.target.value })}
                placeholder="Enter video description"
                className="min-h-[100px]"
              />
            </div>

            <div>
              <label htmlFor="video" className="block text-sm font-medium text-gray-700 mb-1">
                Video File
              </label>
              <div className="mt-1 flex items-center">
                <input
                  type="file"
                  id="video"
                  accept="video/*"
                  onChange={handleVideoChange}
                  className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-[#ffd6c0] file:text-white
                  hover:file:bg-[#ffcbb0]"
                />
              </div>
              <p className="mt-1 text-sm text-gray-500">MP4, WebM, or Ogg. Max 100MB.</p>
              {currentVideo.video_url && !videoFile && (
                <div className="mt-2">
                  <p className="text-sm text-gray-600">Current video: {currentVideo.video_url.split("/").pop()}</p>
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
                <Save className="mr-2 h-4 w-4" /> Save Video
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {videos.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No banner videos yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Video
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Group videos by position */}
              {[0, 1, 2].map((position) => {
                const positionVideos = videos.filter((v) => v.position === position)
                if (positionVideos.length === 0) return null

                return (
                  <div key={`position-${position}`} className="mb-8">
                    <h3 className="text-lg font-medium mb-3">
                      Position {position} -{" "}
                      {position === 0 ? "After Welcome" : position === 1 ? "After Products" : "After Blog"}
                      <span className="text-sm text-gray-500 ml-2">
                        ({positionVideos.length} video{positionVideos.length !== 1 ? "s" : ""})
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {positionVideos.map((video) => (
                        <Card key={video.id} className="overflow-hidden">
                          <CardContent className="p-0">
                            <div className="flex flex-col">
                              <div className="w-full h-48 bg-gray-100 relative">
                                {video.video_url ? (
                                  <video
                                    src={video.video_url}
                                    className="w-full h-full object-cover"
                                    muted
                                    playsInline
                                  />
                                ) : (
                                  <div className="flex items-center justify-center h-full">
                                    <Video className="h-12 w-12 text-gray-400" />
                                  </div>
                                )}
                              </div>
                              <div className="p-4 flex-1">
                                <h3 className="text-xl font-semibold mb-2">{video.title}</h3>
                                <p className="text-gray-600 mb-4 line-clamp-2">{video.description}</p>
                                <div className="flex justify-end space-x-2 mt-4">
                                  <Button variant="outline" size="sm" onClick={() => handleEdit(video)}>
                                    <Edit className="h-4 w-4 mr-1" /> Edit
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="text-red-500 hover:text-red-700"
                                    onClick={() => handleDelete(video.id)}
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
