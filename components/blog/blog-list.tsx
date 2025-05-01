"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url: string
  created_at: string
}

export default function BlogList() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setLoading(true)

        // Try to fetch from Supabase
        const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

        if (error) {
          // If the table doesn't exist, use fallback data
          if (error.message.includes("does not exist")) {
            setBlogPosts(getFallbackBlogPosts())
          } else {
            setError(`Failed to load blog posts: ${error.message}`)
            setBlogPosts(getFallbackBlogPosts())
          }
        } else {
          setBlogPosts(data && data.length > 0 ? data : getFallbackBlogPosts())
          setError(null)
        }
      } catch (error) {
        setError("An unexpected error occurred while loading blog posts")
        setBlogPosts(getFallbackBlogPosts())
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Add this function to provide fallback data
  function getFallbackBlogPosts(): BlogPost[] {
    return [
      {
        id: "1",
        title: "The Benefits of Mindful Consumption",
        summary: "Discover how mindful consumption can enhance your wellness journey and promote balance in your life.",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        image_url: "/placeholder.svg?height=300&width=500",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Understanding Different Product Types",
        summary: "A comprehensive guide to understanding the different types of products and their effects.",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        image_url: "/placeholder.svg?height=300&width=500",
        created_at: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: "3",
        title: "Wellness Practices for Daily Life",
        summary: "Simple wellness practices you can incorporate into your daily routine for better health and balance.",
        content:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
        image_url: "/placeholder.svg?height=300&width=500",
        created_at: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ]
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/30 backdrop-blur-sm p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-40 bg-white/40 rounded mb-4"></div>
            <div className="h-6 bg-white/40 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/40 rounded mb-2"></div>
            <div className="h-4 bg-white/40 rounded w-5/6 mb-2"></div>
            <div className="h-4 bg-white/40 rounded w-4/6 mb-4"></div>
            <div className="h-8 bg-white/40 rounded-full w-1/3"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-black">Showing fallback blog posts instead</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-6">
          {blogPosts.map((post) => renderBlogPost(post))}
        </div>
      </div>
    )
  }

  if (blogPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg">
        <p className="text-xl text-black">No blog posts available yet.</p>
        <p className="text-black mt-2">Check back soon for updates!</p>
      </div>
    )
  }

  function renderBlogPost(post: BlogPost) {
    return (
      <div
        key={post.id}
        className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border border-white/30"
      >
        {post.image_url && (
          <div className="mb-4 overflow-hidden rounded-lg mx-auto w-1/2 flex items-center justify-center">
            <img
              src={post.image_url || "/placeholder.svg"}
              alt={post.title}
              className="w-full object-contain transition-transform duration-300 hover:scale-105"
              style={{ maxHeight: "150px" }}
            />
          </div>
        )}
        <div>
          <h2 className="text-2xl font-semibold mb-3 text-black">{post.title}</h2>
          <p className="text-gray-700 mb-4 line-clamp-3 font-medium">{post.summary}</p>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <Link
              href={`/blog/${post.id}`}
              className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold"
            >
              Read more <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogPosts.map((post) => renderBlogPost(post))}
    </div>
  )
}
