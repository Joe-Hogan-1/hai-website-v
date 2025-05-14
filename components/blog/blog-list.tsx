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

interface BlogListProps {
  limit?: number
  showExcerpt?: boolean
  className?: string
}

export function BlogList({ limit, showExcerpt = true, className = "" }: BlogListProps) {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setLoading(true)

        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(limit || 10)

        if (error) {
          setError(`Failed to load blog posts: ${error.message}`)
          setBlogPosts([])
        } else {
          setBlogPosts(data || [])
          setError(null)
        }
      } catch (error) {
        setError("An unexpected error occurred while loading blog posts")
        setBlogPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [limit])

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white/30 backdrop-blur-sm p-6 rounded-lg shadow-md animate-pulse">
            <div className="h-[220px] bg-white/40 rounded mb-4"></div>
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
        <p className="text-black">Unable to load lifestyle articles</p>
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

  return (
    <div className={className}>
      {blogPosts.map((post) => (
        <Link key={post.id} href={`/lifestyle/${post.id}`} className="block mb-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border border-white/30 h-full flex flex-col">
            {post.image_url && (
              <div className="mb-4 overflow-hidden rounded-lg mx-auto w-full h-[220px]">
                <img
                  src={post.image_url || "/placeholder.svg"}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              </div>
            )}
            <div className="flex-grow">
              <h2 className="text-2xl font-semibold mb-3 text-black">{post.title}</h2>
              {showExcerpt && <p className="text-gray-700 mb-4 line-clamp-3 font-medium">{post.summary}</p>}
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-500">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <div className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold underline">
                  Read more <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
