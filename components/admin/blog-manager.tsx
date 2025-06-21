"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, Eye, EyeOff, Star, StarOff, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url: string | null
  slug: string
  published: boolean
  featured: boolean
  view_count: number
  created_at: string
  updated_at: string
  user_id: string
  embedded_image_url_1?: string | null
  embedded_image_url_2?: string | null
  embedded_image_url_3?: string | null
}

interface BlogManagerProps {
  userId: string
}

const initialBlogState: Partial<BlogPost> = {
  title: "",
  summary: "",
  content: "",
  image_url: null,
  slug: "",
  published: false,
  featured: false,
  embedded_image_url_1: null,
  embedded_image_url_2: null,
  embedded_image_url_3: null,
}

export default function BlogManager({ userId }: BlogManagerProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [currentBlog, setCurrentBlog] = useState<Partial<BlogPost>>(initialBlogState)

  // Files for upload
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [embeddedImageFile1, setEmbeddedImageFile1] = useState<File | null>(null)
  const [embeddedImageFile2, setEmbeddedImageFile2] = useState<File | null>(null)
  const [embeddedImageFile3, setEmbeddedImageFile3] = useState<File | null>(null)

  const [uploadProgress, setUploadProgress] = useState(0)
  const [activeTab, setActiveTab] = useState("all")
  const [publishLoading, setPublishLoading] = useState<string | null>(null)
  const [imagesToDeleteOnSave, setImagesToDeleteOnSave] = useState<Set<string>>(new Set())

  const fetchBlogPosts = useCallback(async () => {
    try {
      setLoading(true)
      // Use fallback approach for better compatibility
      const { data, error } = await supabase
        .rpc("get_user_blog_posts", { limit_count: 50, offset_count: 0 })
        .order("created_at", { ascending: false })

      if (error) {
        console.log("RPC failed, falling back to direct query:", error)
        // Fall back to direct query
        const { data: directData, error: directError } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false })

        if (directError) throw directError
        setBlogPosts(directData || [])
      } else {
        setBlogPosts(data || [])
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error)
      toast.error("Failed to load blog posts")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBlogPosts()
  }, [fetchBlogPosts])

  const resetFormState = () => {
    setCurrentBlog(initialBlogState)
    setImageFile(null)
    setEmbeddedImageFile1(null)
    setEmbeddedImageFile2(null)
    setEmbeddedImageFile3(null)
    setImagesToDeleteOnSave(new Set())
    setUploadProgress(0)
  }

  const handleCreateNew = () => {
    resetFormState()
    setIsEditing(true)
  }

  const handleEdit = (blog: BlogPost) => {
    setCurrentBlog(blog)
    setImageFile(null)
    setEmbeddedImageFile1(null)
    setEmbeddedImageFile2(null)
    setEmbeddedImageFile3(null)
    setImagesToDeleteOnSave(new Set())
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    resetFormState()
  }

  const addImageToDelete = (url: string | null | undefined) => {
    if (url) {
      setImagesToDeleteOnSave((prev) => new Set(prev).add(url))
    }
  }

  const handleRemoveEmbeddedImage = (index: 1 | 2 | 3) => {
    const fieldName = `embedded_image_url_${index}` as keyof BlogPost
    addImageToDelete(currentBlog[fieldName] as string | undefined)
    setCurrentBlog((prev) => ({ ...prev, [fieldName]: null }))
    if (index === 1) setEmbeddedImageFile1(null)
    if (index === 2) setEmbeddedImageFile2(null)
    if (index === 3) setEmbeddedImageFile3(null)
  }

  const deleteImagesFromStorage = async (urls: string[]) => {
    const validUrls = urls.filter((url) => url && typeof url === "string")
    if (validUrls.length === 0) return

    try {
      const filePaths = validUrls.map((url) => {
        const urlParts = url.split("/")
        return urlParts[urlParts.length - 1]
      })

      if (filePaths.length > 0) {
        const { error: deleteError } = await supabase.storage.from("blog-images").remove(filePaths)
        if (deleteError) {
          console.error("Error deleting images from storage:", deleteError)
        }
      }
    } catch (error) {
      console.error("Error in deleteImagesFromStorage:", error)
    }
  }

  const handleDelete = async (blogPost: BlogPost) => {
    if (!confirm("Are you sure you want to delete this blog post? This will also delete all associated images.")) return

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", blogPost.id).eq("user_id", userId)
      if (error) throw error

      const imagesUrlsToDelete: string[] = []
      if (blogPost.image_url) imagesUrlsToDelete.push(blogPost.image_url)
      if (blogPost.embedded_image_url_1) imagesUrlsToDelete.push(blogPost.embedded_image_url_1)
      if (blogPost.embedded_image_url_2) imagesUrlsToDelete.push(blogPost.embedded_image_url_2)
      if (blogPost.embedded_image_url_3) imagesUrlsToDelete.push(blogPost.embedded_image_url_3)

      await deleteImagesFromStorage(imagesUrlsToDelete)

      toast.success("Blog post deleted successfully")
      fetchBlogPosts()
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast.error("Failed to delete blog post")
    }
  }

  const handleTogglePublish = async (blog: BlogPost) => {
    try {
      setPublishLoading(blog.id)

      // Try RPC first, fall back to direct update
      // Assuming 'toggle_blog_post_published' RPC might not exist or might have issues.
      // The fallback is now more robust.
      let rpcError: any = null
      try {
        const { error } = await supabase.rpc("toggle_blog_post_published", { post_id: blog.id })
        if (error) rpcError = error
      } catch (e) {
        rpcError = e
      }

      if (rpcError) {
        console.log("RPC toggle_blog_post_published failed or does not exist, using direct update:", rpcError)
        const { error: updateError } = await supabase
          .from("blog_posts")
          .update({
            published: !blog.published,
            updated_at: new Date().toISOString(),
          })
          .eq("id", blog.id)
          .eq("user_id", userId) // Added user_id check for RLS

        if (updateError) {
          console.error("Direct update error:", updateError)
          throw updateError
        }
      }

      toast.success(`Blog post ${!blog.published ? "published" : "unpublished"} successfully`)
      fetchBlogPosts() // Refetch to get the latest state
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast.error("Failed to update publish status")
    } finally {
      setPublishLoading(null)
    }
  }

  const handleToggleFeatured = async (blog: BlogPost) => {
    try {
      const { error } = await supabase
        .from("blog_posts")
        .update({ featured: !blog.featured, updated_at: new Date().toISOString() })
        .eq("id", blog.id)
        .eq("user_id", userId) // Added user_id check for RLS
      if (error) throw error
      toast.success(`Blog post ${!blog.featured ? "featured" : "unfeatured"} successfully`)
      fetchBlogPosts()
    } catch (error) {
      console.error("Error toggling featured status:", error)
      toast.error("Failed to update featured status")
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = fileName

      const { error: uploadError, data } = await supabase.storage.from("blog-images").upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

      if (uploadError) {
        console.error("Upload error:", uploadError)
        throw uploadError
      }

      const { data: urlData } = supabase.storage.from("blog-images").getPublicUrl(filePath)
      return urlData.publicUrl
    } catch (error) {
      console.error("Error in uploadImage:", error)
      throw error
    }
  }

  const generateSlug = (title: string): string => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim()
  }

  const handleSave = async () => {
    if (isSaving) return // Prevent double submission

    try {
      setIsSaving(true)
      console.log("Starting save process...")

      if (!currentBlog.title || !currentBlog.content) {
        toast.error("Title and content are required")
        return
      }

      if (!userId) {
        toast.error("User ID is required")
        return
      }

      console.log("Current blog data:", currentBlog)
      console.log("User ID:", userId)

      const blogDataToSave: any = {
        title: currentBlog.title.trim(),
        summary: currentBlog.summary?.trim() || "",
        content: currentBlog.content.trim(),
        slug: currentBlog.slug?.trim() || generateSlug(currentBlog.title),
        published: Boolean(currentBlog.published),
        featured: Boolean(currentBlog.featured),
        updated_at: new Date().toISOString(),
      }

      // Handle main image upload
      if (imageFile) {
        console.log("Uploading main image...")
        try {
          blogDataToSave.image_url = await uploadImage(imageFile)
          console.log("Main image uploaded:", blogDataToSave.image_url)
        } catch (error) {
          console.error("Failed to upload main image:", error)
          toast.error("Failed to upload main image")
          return
        }
      } else if (currentBlog.image_url !== undefined) {
        blogDataToSave.image_url = currentBlog.image_url
      }

      // Handle embedded images
      const embeddedImageUpdates = [
        { file: embeddedImageFile1, field: "embedded_image_url_1" },
        { file: embeddedImageFile2, field: "embedded_image_url_2" },
        { file: embeddedImageFile3, field: "embedded_image_url_3" },
      ]

      for (const update of embeddedImageUpdates) {
        if (update.file) {
          console.log(`Uploading ${update.field}...`)
          try {
            blogDataToSave[update.field] = await uploadImage(update.file)
            console.log(`${update.field} uploaded:`, blogDataToSave[update.field])
          } catch (error) {
            console.error(`Failed to upload ${update.field}:`, error)
            toast.error(`Failed to upload ${update.field}`)
            return
          }
        } else if (currentBlog[update.field as keyof BlogPost] !== undefined) {
          blogDataToSave[update.field] = currentBlog[update.field as keyof BlogPost]
        }
      }

      console.log("Final blog data to save:", blogDataToSave)

      if (currentBlog.id) {
        // Update existing blog post
        console.log("Updating existing blog post...")
        const { error } = await supabase
          .from("blog_posts")
          .update(blogDataToSave)
          .eq("id", currentBlog.id)
          .eq("user_id", userId)

        if (error) {
          console.error("Update error:", error)
          throw error
        }
        console.log("Blog post updated successfully")
        toast.success("Blog post updated successfully")
      } else {
        // Create new blog post
        console.log("Creating new blog post...")
        blogDataToSave.user_id = userId

        const { data, error } = await supabase.from("blog_posts").insert([blogDataToSave]).select()

        if (error) {
          console.error("Insert error:", error)
          throw error
        }
        console.log("Blog post created successfully:", data)
        toast.success("Blog post created successfully")
      }

      // Clean up old images if any were marked for deletion
      if (imagesToDeleteOnSave.size > 0) {
        console.log("Cleaning up old images...")
        await deleteImagesFromStorage(Array.from(imagesToDeleteOnSave))
      }

      setIsEditing(false)
      fetchBlogPosts()
      resetFormState()
    } catch (error) {
      console.error("Error saving blog post:", error)
      if (error instanceof Error) {
        toast.error(`Failed to save blog post: ${error.message}`)
      } else {
        toast.error("Failed to save blog post")
      }
    } finally {
      setIsSaving(false)
    }
  }

  const filteredPosts =
    activeTab === "all"
      ? blogPosts
      : activeTab === "published"
        ? blogPosts.filter((post) => post.published)
        : activeTab === "draft"
          ? blogPosts.filter((post) => !post.published)
          : activeTab === "featured"
            ? blogPosts.filter((post) => post.featured)
            : blogPosts

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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={currentBlog.title || ""}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, title: e.target.value })}
                  placeholder="Enter blog title"
                  required
                />
              </div>
              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Slug (optional)
                </label>
                <Input
                  id="slug"
                  value={currentBlog.slug || ""}
                  onChange={(e) => setCurrentBlog({ ...currentBlog, slug: e.target.value })}
                  placeholder="Auto-generated if blank"
                />
              </div>
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
                Content *
              </label>
              <Textarea
                id="content"
                value={currentBlog.content || ""}
                onChange={(e) => setCurrentBlog({ ...currentBlog, content: e.target.value })}
                placeholder="Write your blog content here... Use [EMBED_IMAGE_1], [EMBED_IMAGE_2], [EMBED_IMAGE_3] for embedded images."
                className="min-h-[250px]"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Use placeholders like <code>[EMBED_IMAGE_1]</code> in the content to position embedded images.
              </p>
            </div>

            {/* Main Featured Image */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Main Featured Image</label>
              <ImageUploader
                existingImageUrl={currentBlog.image_url}
                onImageSelected={setImageFile}
                uploadProgress={imageFile ? uploadProgress : 0}
              />
              {currentBlog.image_url && !imageFile && (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => {
                    addImageToDelete(currentBlog.image_url)
                    setCurrentBlog((prev) => ({ ...prev, image_url: null }))
                  }}
                >
                  <XCircle className="mr-2 h-4 w-4" /> Remove Main Image
                </Button>
              )}
            </div>

            {/* Embedded Images Sections */}
            {[1, 2, 3].map((index) => (
              <div key={index} className="border-t pt-4 mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">Embedded Image {index}</label>
                <p className="text-xs text-gray-500 mb-2">
                  This image will replace <code>[EMBED_IMAGE_{index}]</code> in your content.
                </p>
                <ImageUploader
                  existingImageUrl={
                    currentBlog[`embedded_image_url_${index}` as keyof BlogPost] as string | null | undefined
                  }
                  onImageSelected={(file) => {
                    if (index === 1) setEmbeddedImageFile1(file)
                    else if (index === 2) setEmbeddedImageFile2(file)
                    else setEmbeddedImageFile3(file)
                  }}
                  uploadProgress={
                    (index === 1 && embeddedImageFile1) ||
                    (index === 2 && embeddedImageFile2) ||
                    (index === 3 && embeddedImageFile3)
                      ? uploadProgress
                      : 0
                  }
                />
                {currentBlog[`embedded_image_url_${index}` as keyof BlogPost] &&
                  !(index === 1 && embeddedImageFile1) &&
                  !(index === 2 && embeddedImageFile2) &&
                  !(index === 3 && embeddedImageFile3) && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-2"
                      onClick={() => handleRemoveEmbeddedImage(index as 1 | 2 | 3)}
                    >
                      <XCircle className="mr-2 h-4 w-4" /> Remove Embedded Image {index}
                    </Button>
                  )}
              </div>
            ))}

            {/* Published and Featured Checkboxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <Checkbox
                    id="published"
                    checked={currentBlog.published || false}
                    onCheckedChange={(checked) => setCurrentBlog({ ...currentBlog, published: checked as boolean })}
                  />
                  <label htmlFor="published" className="text-sm font-medium">
                    Published
                  </label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="featured"
                    checked={currentBlog.featured || false}
                    onCheckedChange={(checked) => setCurrentBlog({ ...currentBlog, featured: checked as boolean })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium">
                    Featured
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" /> Save Blog Post
                  </>
                )}
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
            <div>
              <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-6">
                <TabsList>
                  <TabsTrigger value="all">All Posts ({blogPosts.length})</TabsTrigger>
                  <TabsTrigger value="published">Published ({blogPosts.filter((p) => p.published).length})</TabsTrigger>
                  <TabsTrigger value="draft">Drafts ({blogPosts.filter((p) => !p.published).length})</TabsTrigger>
                  <TabsTrigger value="featured">Featured ({blogPosts.filter((p) => p.featured).length})</TabsTrigger>
                </TabsList>
              </Tabs>

              <div className="space-y-6">
                {filteredPosts.map((blog) => (
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
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-xl font-semibold">{blog.title}</h3>
                            <div className="flex space-x-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleTogglePublish(blog)}
                                title={blog.published ? "Unpublish" : "Publish"}
                                disabled={publishLoading === blog.id}
                              >
                                {publishLoading === blog.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                                ) : blog.published ? (
                                  <Eye className="h-4 w-4" />
                                ) : (
                                  <EyeOff className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleFeatured(blog)}
                                title={blog.featured ? "Remove from featured" : "Add to featured"}
                              >
                                {blog.featured ? (
                                  <Star className="h-4 w-4 text-yellow-500" />
                                ) : (
                                  <StarOff className="h-4 w-4" />
                                )}
                              </Button>
                            </div>
                          </div>
                          <p className="text-gray-600 mb-4">{blog.summary}</p>
                          <div className="flex justify-between items-center">
                            <div>
                              <span className="text-sm text-gray-500 mr-4">
                                {new Date(blog.created_at).toLocaleDateString()}
                              </span>
                              {blog.view_count > 0 && (
                                <span className="text-sm text-gray-500">{blog.view_count} views</span>
                              )}
                            </div>
                            <div className="space-x-2">
                              <Button variant="outline" size="sm" onClick={() => handleEdit(blog)}>
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(blog)}
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
            </div>
          )}
        </>
      )}
    </div>
  )
}
