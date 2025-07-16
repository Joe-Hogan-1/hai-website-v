"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { toast } from "@/hooks/use-toast"
import { Trash2, Edit, Eye, EyeOff, Plus, Save, X } from "lucide-react"
import ImageUploader from "./image-uploader"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url?: string
  published: boolean
  created_at: string
  updated_at?: string
  embedded_image_url_1?: string
  embedded_image_url_2?: string
  embedded_image_url_3?: string
}

interface BlogManagerProps {
  userId: string
}

export default function BlogManager({ userId }: BlogManagerProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [publishLoading, setPublishLoading] = useState<string | null>(null)
  const [currentPost, setCurrentPost] = useState<Partial<BlogPost>>({
    title: "",
    summary: "",
    content: "",
    image_url: "",
    published: false,
    embedded_image_url_1: "",
    embedded_image_url_2: "",
    embedded_image_url_3: "",
  })

  const fetchBlogPosts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching blog posts:", error)
        toast({
          title: "Error",
          description: "Failed to fetch blog posts",
          variant: "destructive",
        })
        return
      }

      setBlogPosts(data || [])
    } catch (error) {
      console.error("Unexpected error:", error)
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBlogPosts()
  }, [userId])

  const handleSave = async () => {
    try {
      if (!currentPost.title?.trim()) {
        toast({
          title: "Error",
          description: "Title is required",
          variant: "destructive",
        })
        return
      }

      const postData = {
        title: currentPost.title.trim(),
        summary: currentPost.summary?.trim() || "",
        content: currentPost.content?.trim() || "",
        image_url: currentPost.image_url || null,
        published: currentPost.published || false,
        embedded_image_url_1: currentPost.embedded_image_url_1 || null,
        embedded_image_url_2: currentPost.embedded_image_url_2 || null,
        embedded_image_url_3: currentPost.embedded_image_url_3 || null,
        updated_at: new Date().toISOString(),
      }

      if (currentPost.id) {
        // Update existing post
        const { error } = await supabase
          .from("blog_posts")
          .update(postData)
          .eq("id", currentPost.id)
          .eq("user_id", userId)

        if (error) throw error
        toast({
          title: "Success",
          description: "Blog post updated successfully",
        })
      } else {
        // Create new post
        const { error } = await supabase.from("blog_posts").insert({
          ...postData,
          user_id: userId,
        })

        if (error) throw error
        toast({
          title: "Success",
          description: "Blog post created successfully",
        })
      }

      setIsEditing(false)
      setCurrentPost({
        title: "",
        summary: "",
        content: "",
        image_url: "",
        published: false,
        embedded_image_url_1: "",
        embedded_image_url_2: "",
        embedded_image_url_3: "",
      })
      fetchBlogPosts()
    } catch (error) {
      console.error("Error saving blog post:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save blog post",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (post: BlogPost) => {
    setCurrentPost({
      ...post,
      embedded_image_url_1: post.embedded_image_url_1 || "",
      embedded_image_url_2: post.embedded_image_url_2 || "",
      embedded_image_url_3: post.embedded_image_url_3 || "",
    })
    setIsEditing(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this blog post?")) return

    try {
      const { error } = await supabase.from("blog_posts").delete().eq("id", id).eq("user_id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Blog post deleted successfully",
      })
      fetchBlogPosts()
    } catch (error) {
      console.error("Error deleting blog post:", error)
      toast({
        title: "Error",
        description: "Failed to delete blog post",
        variant: "destructive",
      })
    }
  }

  const handleTogglePublish = async (post: BlogPost) => {
    try {
      setPublishLoading(post.id)

      const { error } = await supabase
        .from("blog_posts")
        .update({
          published: !post.published,
          updated_at: new Date().toISOString(),
        })
        .eq("id", post.id)
        .eq("user_id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: `Blog post ${!post.published ? "published" : "unpublished"} successfully`,
      })

      // Update local state immediately for better UX
      setBlogPosts((prev) =>
        prev.map((p) =>
          p.id === post.id ? { ...p, published: !p.published, updated_at: new Date().toISOString() } : p,
        ),
      )
    } catch (error) {
      console.error("Error toggling publish status:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update publish status",
        variant: "destructive",
      })
    } finally {
      setPublishLoading(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentPost({
      title: "",
      summary: "",
      content: "",
      image_url: "",
      published: false,
      embedded_image_url_1: "",
      embedded_image_url_2: "",
      embedded_image_url_3: "",
    })
  }

  const publishedPosts = blogPosts.filter((post) => post.published)
  const draftPosts = blogPosts.filter((post) => !post.published)

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Blog Manager</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Blog Manager</CardTitle>
          <Button onClick={() => setIsEditing(true)} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            New Post
          </Button>
        </CardHeader>
        <CardContent>
          {isEditing ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium mb-2">
                  Title *
                </label>
                <Input
                  id="title"
                  value={currentPost.title || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                  placeholder="Enter blog post title"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium mb-2">
                  Summary
                </label>
                <Textarea
                  id="summary"
                  value={currentPost.summary || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, summary: e.target.value })}
                  placeholder="Enter a brief summary"
                  rows={3}
                />
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium mb-2">
                  Content
                </label>
                <Textarea
                  id="content"
                  value={currentPost.content || ""}
                  onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                  placeholder="Enter blog post content. Use [EMBED_IMAGE_1], [EMBED_IMAGE_2], or [EMBED_IMAGE_3] to embed images."
                  rows={10}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Main Image</label>
                <ImageUploader
                  currentImageUrl={currentPost.image_url || ""}
                  onImageSelected={(url) => setCurrentPost({ ...currentPost, image_url: url })}
                  bucketName="blog-images"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Embedded Image 1</label>
                  <ImageUploader
                    currentImageUrl={currentPost.embedded_image_url_1 || ""}
                    onImageSelected={(url) => setCurrentPost({ ...currentPost, embedded_image_url_1: url })}
                    bucketName="blog-images"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Embedded Image 2</label>
                  <ImageUploader
                    currentImageUrl={currentPost.embedded_image_url_2 || ""}
                    onImageSelected={(url) => setCurrentPost({ ...currentPost, embedded_image_url_2: url })}
                    bucketName="blog-images"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Embedded Image 3</label>
                  <ImageUploader
                    currentImageUrl={currentPost.embedded_image_url_3 || ""}
                    onImageSelected={(url) => setCurrentPost({ ...currentPost, embedded_image_url_3: url })}
                    bucketName="blog-images"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="published"
                  checked={currentPost.published || false}
                  onChange={(e) => setCurrentPost({ ...currentPost, published: e.target.checked })}
                />
                <label htmlFor="published" className="text-sm font-medium">
                  Publish immediately
                </label>
              </div>

              <div className="flex gap-2">
                <Button onClick={handleSave} className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save
                </Button>
                <Button variant="outline" onClick={handleCancel} className="flex items-center gap-2 bg-transparent">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="all">All Posts ({blogPosts.length})</TabsTrigger>
                <TabsTrigger value="published">Published ({publishedPosts.length})</TabsTrigger>
                <TabsTrigger value="drafts">Drafts ({draftPosts.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4">
                {blogPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No blog posts yet. Create your first post!</p>
                ) : (
                  blogPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          {post.summary && <p className="text-gray-600 text-sm mt-1">{post.summary}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant={post.published ? "default" : "secondary"}>
                              {post.published ? "Published" : "Draft"}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {post.created_at ? new Date(post.created_at).toLocaleDateString() : "No date"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(post)}
                            disabled={publishLoading === post.id}
                            className="flex items-center gap-1"
                          >
                            {post.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            {publishLoading === post.id ? "..." : post.published ? "Unpublish" : "Publish"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="published" className="space-y-4">
                {publishedPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No published posts yet.</p>
                ) : (
                  publishedPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          {post.summary && <p className="text-gray-600 text-sm mt-1">{post.summary}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="default">Published</Badge>
                            <span className="text-xs text-gray-500">
                              {post.created_at ? new Date(post.created_at).toLocaleDateString() : "No date"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(post)}
                            disabled={publishLoading === post.id}
                            className="flex items-center gap-1"
                          >
                            <EyeOff className="h-4 w-4" />
                            {publishLoading === post.id ? "..." : "Unpublish"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="drafts" className="space-y-4">
                {draftPosts.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No draft posts.</p>
                ) : (
                  draftPosts.map((post) => (
                    <div key={post.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{post.title}</h3>
                          {post.summary && <p className="text-gray-600 text-sm mt-1">{post.summary}</p>}
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="secondary">Draft</Badge>
                            <span className="text-xs text-gray-500">
                              {post.created_at ? new Date(post.created_at).toLocaleDateString() : "No date"}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleTogglePublish(post)}
                            disabled={publishLoading === post.id}
                            className="flex items-center gap-1"
                          >
                            <Eye className="h-4 w-4" />
                            {publishLoading === post.id ? "..." : "Publish"}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(post)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(post.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
