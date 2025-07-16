"use client"

import { useEffect, useState } from "react"
import { supabase } from "@/utils/supabase"
import { useInView } from "react-intersection-observer"
import RiverImageBanner from "./river-image-banner"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url: string
  created_at: string
}

interface BlogImageBannerProps {
  position: number // 0, 1, 2, or 3 to indicate which position to display
}

export default function BlogImageBanner({ position }: BlogImageBannerProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: false })

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        // Explicitly order by created_at in descending order to get the most recent posts
        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(3)

        if (error) {
          setError(`Error fetching blog posts: ${error.message}`)
          setBlogPosts([])
        } else {
          setBlogPosts(data || [])
          setError(null)
        }
      } catch (error) {
        setError(`Unexpected error fetching blog posts`)
        setBlogPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()

    // Subscribe to changes in the blog_posts table
    const channel = supabase
      .channel(`blog_posts_changes`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "blog_posts",
        },
        () => {
          fetchBlogPosts()
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // If no blog posts are available, use placeholder data
  useEffect(() => {
    if (!loading && blogPosts.length === 0 && !error) {
      // Create placeholder blog posts
      const placeholders: BlogPost[] = [
        {
          id: "placeholder-1",
          title: "Wellness Tips for Daily Life",
          summary: "Discover simple ways to incorporate wellness into your everyday routine.",
          content: "",
          image_url: "/placeholder.svg?height=300&width=500",
          created_at: new Date().toISOString(),
        },
        {
          id: "placeholder-2",
          title: "The Benefits of Natural Products",
          summary: "Learn why natural products are better for your body and the environment.",
          content: "",
          image_url: "/placeholder.svg?height=300&width=500",
          created_at: new Date().toISOString(),
        },
        {
          id: "placeholder-3",
          title: "Finding Balance in a Busy World",
          summary: "Tips for maintaining balance between wellness and productivity.",
          content: "",
          image_url: "/placeholder.svg?height=300&width=500",
          created_at: new Date().toISOString(),
        },
      ]
      setBlogPosts(placeholders)
    }
  }, [loading, blogPosts.length, error])

  if (loading) {
    return (
      <div className="image-banner-section flex items-center justify-center">
        <div className="text-white text-xl">Loading blog posts...</div>
      </div>
    )
  }

  // If error, show a message
  if (error) {
    return (
      <div className="image-banner-section flex items-center justify-center">
        <div className="text-white text-xl">{error}</div>
      </div>
    )
  }

  return (
    <div ref={ref} className="image-banner-section relative overflow-visible">
      {blogPosts.map((post, index) => (
        <RiverImageBanner
          key={post.id}
          imageUrl={post.image_url}
          title={post.title}
          description={post.summary}
          linkUrl={`/blog/${post.id}`}
          totalImages={blogPosts.length}
          imageIndex={index}
          position={position}
        />
      ))}
    </div>
  )
}
