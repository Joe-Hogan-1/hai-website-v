"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import Link from "next/link"
import { ArrowRight, Loader2 } from "lucide-react"

interface BlogPost {
  id: string
  title: string
  summary: string
  content: string
  image_url: string
  created_at: string
  published: boolean
}

export default function HorizontalBlogCarousel() {
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([])
  const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const postsPerPage = 5

  // Initial fetch of blog posts
  useEffect(() => {
    async function fetchBlogPosts() {
      try {
        setLoading(true)
        setError(null)

        const { data, error } = await supabase
          .from("blog_posts")
          .select("*")
          .eq("published", true)
          .order("created_at", { ascending: false })

        if (error) {
          console.error("Error fetching blog posts:", error)
          setError(`Failed to load blog posts: ${error.message}`)
          setBlogPosts([])
          setDisplayedPosts([])
        } else {
          const posts = data || []
          // Ensure all posts have the required fields and are published
          const validPosts = posts.filter(
            (post) => post && typeof post.id === "string" && typeof post.title === "string" && post.published === true,
          )

          setBlogPosts(validPosts)
          setDisplayedPosts(validPosts.slice(0, postsPerPage))
          setHasMore(validPosts.length > postsPerPage)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setError("An unexpected error occurred while loading blog posts.")
        setBlogPosts([])
        setDisplayedPosts([])
      } finally {
        setLoading(false)
      }
    }

    fetchBlogPosts()
  }, [])

  // Function to load more posts
  const loadMorePosts = useCallback(() => {
    if (loadingMore || !hasMore) return

    setLoadingMore(true)

    // Simulate loading delay
    setTimeout(() => {
      const nextPage = page + 1
      const startIndex = (nextPage - 1) * postsPerPage
      const endIndex = startIndex + postsPerPage

      // Check if there are more posts to load
      if (startIndex >= blogPosts.length) {
        setHasMore(false)
        setLoadingMore(false)
        return
      }

      // Add more posts to the displayed posts
      const newPosts = blogPosts.slice(0, endIndex)
      setDisplayedPosts(newPosts)
      setPage(nextPage)
      setHasMore(endIndex < blogPosts.length)
      setLoadingMore(false)
    }, 500)
  }, [blogPosts, hasMore, loadingMore, page, postsPerPage])

  // Intersection Observer for infinite scroll - now for horizontal scrolling
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "0px 200px 0px 0px", // Changed to detect right edge
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loadingMore) {
        loadMorePosts()
      }
    }, options)

    // Create a sentinel element at the right of the container
    const sentinel = document.getElementById("scroll-sentinel")
    if (sentinel) {
      observer.observe(sentinel)
    }

    return () => {
      if (sentinel) {
        observer.unobserve(sentinel)
      }
    }
  }, [hasMore, loadingMore, loadMorePosts])

  // Create a card component to ensure consistency
  const BlogCard = ({ post }: { post: BlogPost }) => (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-white/30 transition-all duration-300 hover:shadow-lg flex flex-col w-[350px] h-[480px] flex-shrink-0">
      <div className="mb-3 overflow-hidden rounded-lg w-full h-[320px] bg-gray-100 flex-shrink-0">
        <img
          src={post.image_url || "/placeholder.svg?height=160&width=320&query=lifestyle"}
          alt={post.title || "Blog post"}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg?height=160&width=320"
          }}
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-black line-clamp-2 text-left">{post.title || "Untitled"}</h3>
        <p className="text-gray-700 mb-2 text-sm line-clamp-2 flex-grow text-left">{post.summary || ""}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xs text-gray-500">
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })
              : "No date"}
          </span>
          <div className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold text-sm">
            Read more <ArrowRight className="ml-1 h-3 w-3" />
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <div className="h-full flex items-center">
        <div className="flex space-x-4 overflow-x-auto pb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="w-[280px] h-[280px] flex-shrink-0">
              <div className="h-[140px] bg-white/40 rounded mb-4 animate-pulse"></div>
              <div className="w-3/4 h-6 bg-white/40 rounded mb-3 animate-pulse"></div>
              <div className="w-full h-4 bg-white/40 rounded mb-2 animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <p className="text-black">Unable to load lifestyle articles</p>
        </div>
      </div>
    )
  }

  if (displayedPosts.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl text-black">No published lifestyle articles available yet.</p>
          <p className="text-black mt-2">Check back soon for updates!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-full relative">
      {/* Horizontal scrollable container for all articles */}
      <div
        ref={containerRef}
        className="overflow-x-auto h-full hide-scrollbar pb-4 scroll-smooth"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
          WebkitOverflowScrolling: "touch",
        }}
      >
        <div className="flex space-x-4 pr-4">
          {displayedPosts.map((post) => (
            <Link key={post.id} href={`/lifestyle/${post.id}`} className="block">
              <BlogCard post={post} />
            </Link>
          ))}

          {/* Sentinel element for infinite scroll - now at the right edge */}
          <div id="scroll-sentinel" className="w-4 flex-shrink-0">
            {loadingMore && (
              <div className="flex justify-center items-center h-full">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add some custom styles for the scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          height: 4px;
        }
        .hide-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .hide-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(0, 0, 0, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  )
}
