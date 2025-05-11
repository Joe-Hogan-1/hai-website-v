"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/utils/supabase"
import Link from "next/link"
import { ArrowRight, ChevronDown } from "lucide-react"

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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showScrollIndicator, setShowScrollIndicator] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

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

  // Check if we need to show the scroll indicator
  useEffect(() => {
    if (blogPosts.length > 3) {
      setShowScrollIndicator(true)
    } else {
      setShowScrollIndicator(false)
    }
  }, [blogPosts])

  // Handle scroll events to hide indicator when user has scrolled down
  useEffect(() => {
    const handleScroll = () => {
      if (scrollContainerRef.current) {
        const { scrollTop } = scrollContainerRef.current
        // Hide indicator when user has scrolled down
        if (scrollTop > 10) {
          setShowScrollIndicator(false)
        } else {
          setShowScrollIndicator(blogPosts.length > 3)
        }
      }
    }

    const scrollContainer = scrollContainerRef.current
    if (scrollContainer) {
      scrollContainer.addEventListener("scroll", handleScroll)
    }

    return () => {
      if (scrollContainer) {
        scrollContainer.removeEventListener("scroll", handleScroll)
      }
    }
  }, [blogPosts.length])

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
    ]
  }

  // Handle scroll to reveal more articles
  const scrollToMore = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        top: scrollContainerRef.current.scrollTop + 200,
        behavior: "smooth",
      })
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center">
        <div className="w-full h-32 bg-white/40 rounded mb-4 animate-pulse"></div>
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

  // Get only the first 3 posts to display initially
  const visiblePosts = blogPosts.slice(0, 3)
  const remainingPosts = blogPosts.slice(3)

  return (
    <div className="h-full flex flex-col">
      {/* Container for the first 3 articles - these are always visible */}
      <div className="space-y-4 mb-2">
        {visiblePosts.map((post) => (
          <div key={post.id}>
            <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-white/30">
              {post.image_url && (
                <div className="mb-3 overflow-hidden rounded-lg">
                  <img
                    src={post.image_url || "/placeholder.svg"}
                    alt={post.title}
                    className="w-full h-32 object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
              )}
              <h3 className="text-lg font-semibold mb-2 text-black">{post.title}</h3>
              <p className="text-gray-700 mb-3 text-sm line-clamp-2">{post.summary}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-500">
                  {new Date(post.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </span>
                <Link
                  href={`/lifestyle/${post.id}`}
                  className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold text-sm"
                >
                  Read more <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator and container for remaining articles */}
      {remainingPosts.length > 0 && (
        <div className="relative">
          {/* Scroll indicator */}
          {showScrollIndicator && (
            <div className="flex justify-center mb-2 animate-bounce cursor-pointer" onClick={scrollToMore}>
              <div className="bg-white/80 rounded-full p-1 shadow-md">
                <ChevronDown className="h-5 w-5 text-gray-600" />
              </div>
            </div>
          )}

          {/* Scrollable container for remaining articles */}
          <div
            ref={scrollContainerRef}
            className="overflow-y-auto pr-1 max-h-40 hide-scrollbar"
            style={{
              scrollbarWidth: "thin",
              scrollbarColor: "rgba(0, 0, 0, 0.2) transparent",
            }}
          >
            <div className="space-y-4">
              {remainingPosts.map((post) => (
                <div key={post.id}>
                  <div className="bg-white/90 backdrop-blur-sm p-4 rounded-lg shadow-md border border-white/30">
                    {post.image_url && (
                      <div className="mb-3 overflow-hidden rounded-lg">
                        <img
                          src={post.image_url || "/placeholder.svg"}
                          alt={post.title}
                          className="w-full h-32 object-cover transition-transform duration-300 hover:scale-105"
                        />
                      </div>
                    )}
                    <h3 className="text-lg font-semibold mb-2 text-black">{post.title}</h3>
                    <p className="text-gray-700 mb-3 text-sm line-clamp-2">{post.summary}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-gray-500">
                        {new Date(post.created_at).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                      <Link
                        href={`/lifestyle/${post.id}`}
                        className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold text-sm"
                      >
                        Read more <ArrowRight className="ml-1 h-3 w-3" />
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
