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

  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setBlogPosts(data || [])
      } catch (error) {
        // Error fetching blog posts
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading blog posts...</div>
  }

  if (blogPosts.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-xl text-gray-600">No blog posts available yet.</p>
        <p className="text-gray-500 mt-2">Check back soon for updates!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {blogPosts.map((post) => (
        <div
          key={post.id}
          className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md transition-all duration-300 hover:shadow-xl border border-white/30"
        >
          {post.image_url && (
            <div className="h-48 mb-4 overflow-hidden rounded-lg">
              <img
                src={post.image_url || "/placeholder.svg"}
                alt={post.title}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
          )}
          <div>
            <h2 className="text-2xl font-semibold mb-3 text-[#0e7490]">{post.title}</h2>
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
      ))}
    </div>
  )
}
