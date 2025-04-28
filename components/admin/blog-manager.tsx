"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url: string
  created_at: string
  user_id: string
}

interface BlogManagerProps {
  userId: string
}

export default function BlogManager({ userId }: BlogManagerProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>({
    title: "",
    summary: "",
    content: "",
    image_url: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)

  useEffect(() => {
    fetchBlogPosts()
  }, [])

  const fetchBlogPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setBlogPosts(data || [])
    } catch (error) {
      // Error fetching blog posts
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentBlog({
      title: "",
      summary: "",
      content: "",
      image_url: "",
    })
    setImageFile(null)
    setIsEditing(true)
  }

  const handleEdit = (blog: BlogPost) => {
    setCurrentBlog(blog)
    setImageFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentBlog({
      title: "",
      summary: "",
      content: "",
      image_url: "",
    })
    setImageFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      // First, get the blog post to check if it has an image
      const { data: blog } = await supabase.from("blog_posts").select("image_url").eq("id", id).single()

      // Delete the blog post
      const { error } = await supabase.from("blog_posts").delete().eq("id", id)

      if (error) throw error

      // If there was an image, delete it from storage
      if (blog?.image_url) {
        const imagePath = blog.image_url.split("/").pop()
        if (imagePath) {
          await supabase.storage.from("blog-images").remove([imagePath])
        }
      }

      toast.success("Blog post deleted successfully")
      fetchBlogPosts()
    } catch (error) {
      toast.error("Failed to delete blog post")
    }
  }

  const handleSave = async () => {
    try {
      if (!currentBlog.title || !currentBlog.content) {
        toast.error("Title and content are required")
        return
      }

      let imageUrl = currentBlog.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage.from("blog-images").upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      if (currentBlog.id) {
        // Update existing blog post
        const { error } = await supabase
          .from("blog_posts")
          .update({
            title: currentBlog.title,
            summary: currentBlog.summary,
            content: currentBlog.content,
            image_url: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentBlog.id)
          .eq("user_id", userId) // Ensure user can only update their own posts

        if (error) {
          throw error
        }
        toast.success("Blog post updated successfully")
      } else {
        // Create new blog post
        const { error, data } = await supabase
          .from("blog_posts")
          .insert({
            title: currentBlog.title,
            summary: currentBlog.summary,
            content: currentBlog.content,
            image_url: imageUrl,
            user_id: userId,
          })
          .select()

        if (error) {
          throw error
        }
        toast.success("Blog post created successfully")
      }

      setIsEditing(false)
      fetchBlogPosts()
      setCurrentBlog({
        title: "",
        summary: "",
        content: "",
        image_url: "",
      })
      setImageFile(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to save blog post: ${error.message}`)
      } else {
        toast.error("Failed to save blog post")
      }
    }
  }

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Blog Posts</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Blog Post
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentBlog.id ? "Edit Blog Post" : "Create New Blog Post"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Title
              </label>
              <Input
                id="title"
                value={currentBlog.title || ""}
                onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                placeholder="Enter blog title"
              />
            </div>

            <div>
              <label htmlFor="summary" className="block text-sm font-medium text-gray-700 mb-2">
                Summary
              </label>
              <Input
                id="summary"
                value={currentBlog.summary || ""}
                onChange={(e) => setCurrentBlog({ ...currentBlog, summary: e.target.value })}
                placeholder="Enter a brief summary"
              />
            </div>

            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <Textarea
                id="content"
                value={currentBlog.content || ""}
                onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                placeholder="Write your blog content here..."
                className="min-h-[250px]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Featured Image</label>
              <ImageUploader
                existingImageUrl={currentBlog.image_url}
                onImageSelected={setImageFile}
                uploadProgress={uploadProgress}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Blog Post
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {blogPosts.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No blog posts yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Your First Blog Post
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {blogPosts.map((blog) => (
                <Card key={blog.id} className="overflow-hidden">
                  <CardContent className="p-0">
                    <div className="flex flex-col md:flex-row">
                      {blog.image_url && (
                        <div className="w-full md:w-1/4 h-48 md:h-auto">
                          <img
                            src={blog.image_url || "/placeholder.svg"}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-6 flex-1">
                        <h3 className="text-xl font-semibold mb-2">{blog.title}</h3>
                        <p className="text-gray-600 mb-4">{blog.summary}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-500">
                            {new Date(blog.created_at).toLocaleDateString()}
                          </span>
                          <div className="space-x-2">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(blog.id)}
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
