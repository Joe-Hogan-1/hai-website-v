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
}

export default function VerticalBlogCarousel() {
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

        // Try to fetch from Supabase
        const { data, error } = await supabase.from("blog_posts").select("*").order("created_at", { ascending: false })

        if (error) {
          // If the table doesn't exist, use fallback data
          if (error.message.includes("does not exist")) {
            const fallbackData = getFallbackBlogPosts()
            setBlogPosts(fallbackData)
            setDisplayedPosts(fallbackData.slice(0, postsPerPage))
            setHasMore(fallbackData.length > postsPerPage)
          } else {
            setError(`Failed to load blog posts: ${error.message}`)
            const fallbackData = getFallbackBlogPosts()
            setBlogPosts(fallbackData)
            setDisplayedPosts(fallbackData.slice(0, postsPerPage))
            setHasMore(fallbackData.length > postsPerPage)
          }
        } else {
          const postsData = data && data.length > 0 ? data : getFallbackBlogPosts()
          setBlogPosts(postsData)
          setDisplayedPosts(postsData.slice(0, postsPerPage))
          setHasMore(postsData.length > postsPerPage)
          setError(null)
        }
      } catch (error) {
        setError("An unexpected error occurred while loading blog posts")
        const fallbackData = getFallbackBlogPosts()
        setBlogPosts(fallbackData)
        setDisplayedPosts(fallbackData.slice(0, postsPerPage))
        setHasMore(fallbackData.length > postsPerPage)
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

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const options = {
      root: containerRef.current,
      rootMargin: "0px 0px 200px 0px",
      threshold: 0.1,
    }

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries
      if (entry.isIntersecting && hasMore && !loadingMore) {
        loadMorePosts()
      }
    }, options)

    // Create a sentinel element at the bottom of the container
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

  // Add this function to provide fallback data
  function getFallbackBlogPosts(): BlogPost[] {
    return [
      {
        id: "1",
        title: "The Benefits of CBD for Relaxation",
        summary: "Discover how CBD can help you unwind and relax after a long day.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date().toISOString(),
      },
      {
        id: "2",
        title: "Exploring Cannabis Terpenes",
        summary: "Learn about the aromatic compounds that give cannabis its unique flavors and effects.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date().toISOString(),
      },
      {
        id: "3",
        title: "Cannabis and Creativity",
        summary: "How cannabis has influenced art, music, and creative thinking throughout history.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date().toISOString(),
      },
      {
        id: "4",
        title: "Understanding Different Cannabis Strains",
        summary: "A guide to indica, sativa, and hybrid strains and their effects.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "5",
        title: "The History of Cannabis Cultivation",
        summary: "Tracing the origins and spread of cannabis cultivation throughout human history.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "6",
        title: "Medical Applications of Cannabis",
        summary: "Exploring the growing body of research on cannabis for medical treatments.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "7",
        title: "The Endocannabinoid System Explained",
        summary: "Understanding how cannabis interacts with the body's natural systems.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "8",
        title: "Cannabis Cooking: Beyond Brownies",
        summary: "Creative recipes and techniques for cooking with cannabis.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "9",
        title: "Sustainable Cannabis Cultivation",
        summary: "Eco-friendly approaches to growing cannabis with minimal environmental impact.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
      },
      {
        id: "10",
        title: "Cannabis and Sleep: Finding Balance",
        summary: "How different cannabis compounds can affect sleep patterns and quality.",
        content: "Lorem ipsum dolor sit amet...",
        image_url: "/placeholder.svg",
        created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      },
    ]
  }

  // Create a card component to ensure consistency
  const BlogCard = ({ post }: { post: BlogPost }) => (
    <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-white/30 transition-all duration-300 hover:shadow-lg flex flex-col h-[280px]">
      <div className="mb-3 overflow-hidden rounded-lg w-full h-[140px] bg-gray-100 flex-shrink-0">
        <img
          src={post.image_url || "/placeholder.svg?height=160&width=320&query=lifestyle"}
          alt={post.title}
          className="w-full h-full object-cover object-center transition-transform duration-300 hover:scale-105"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = "/diverse-group-relaxing.png"
          }}
        />
      </div>
      <div className="flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 text-black line-clamp-2 text-left">{post.title}</h3>
        <p className="text-gray-700 mb-2 text-sm line-clamp-2 flex-grow text-left">{post.summary}</p>
        <div className="flex justify-between items-center mt-auto">
          <span className="text-xs text-gray-500">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
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
      <div className="h-full flex flex-col justify-center items-center">
        <div className="w-full h-[160px] bg-white/40 rounded mb-4 animate-pulse"></div>
        <div className="w-3/4 h-6 bg-white/40 rounded mb-3 animate-pulse"></div>
        <div className="w-full h-4 bg-white/40 rounded mb-2 animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-black">Unable to load lifestyle articles</p>
      </div>
    )
  }

  if (blogPosts.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <p className="text-xl text-black">No lifestyle articles available yet.</p>
        <p className="text-black mt-2">Check back soon for updates!</p>
      </div>
    )
  }

  return (
    <div className="absolute inset-0">
      {/* Single scrollable container for all articles */}
      <div
        ref={containerRef}
        className="overflow-y-auto pr-1 h-full hide-scrollbar"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
        }}
      >
        <div className="space-y-4">
          {displayedPosts.map((post) => (
            <Link key={post.id} href={`/lifestyle/${post.id}`} className="block">
              <BlogCard post={post} />
            </Link>
          ))}

          {/* Sentinel element for infinite scroll */}
          <div id="scroll-sentinel" className="h-4">
            {loadingMore && (
              <div className="flex justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add some custom styles for the scrollbar */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          width: 4px;
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
