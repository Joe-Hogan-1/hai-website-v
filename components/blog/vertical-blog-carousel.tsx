"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import Link from "next/link"
import { ArrowRight, ChevronUp, ChevronDown } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [currentIndex, setCurrentIndex] = useState(0)

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
    ]
  }

  const navigateCarousel = (direction: "up" | "down") => {
    if (direction === "up") {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev))
    } else {
      setCurrentIndex((prev) => (prev < blogPosts.length - 1 ? prev + 1 : prev))
    }
  }

  if (loading) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#ffd6c0]/50 rounded-lg p-6">
        <div className="w-full h-32 bg-white/40 rounded mb-4 animate-pulse"></div>
        <div className="w-3/4 h-6 bg-white/40 rounded mb-3 animate-pulse"></div>
        <div className="w-full h-4 bg-white/40 rounded mb-2 animate-pulse"></div>
        <div className="w-5/6 h-4 bg-white/40 rounded mb-4 animate-pulse"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#ffd6c0]/50 rounded-lg p-6">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-black">Unable to load lifestyle articles</p>
      </div>
    )
  }

  if (blogPosts.length === 0) {
    return (
      <div className="h-full flex flex-col justify-center items-center bg-[#ffd6c0]/50 rounded-lg p-6">
        <p className="text-xl text-black">No lifestyle articles available yet.</p>
        <p className="text-black mt-2">Check back soon for updates!</p>
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col bg-[#ffd6c0]/50 rounded-lg p-4 relative">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-semibold">Latest Articles</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => navigateCarousel("up")}
            disabled={currentIndex === 0}
            className="p-2 rounded-full bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous article"
          >
            <ChevronUp size={20} />
          </button>
          <button
            onClick={() => navigateCarousel("down")}
            disabled={currentIndex === blogPosts.length - 1}
            className="p-2 rounded-full bg-black text-white disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next article"
          >
            <ChevronDown size={20} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="h-full"
          >
            <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg shadow-md border border-white/30 h-full flex flex-col">
              {blogPosts[currentIndex].image_url && (
                <div className="mb-4 overflow-hidden rounded-lg mx-auto w-full max-w-md flex items-center justify-center">
                  <img
                    src={blogPosts[currentIndex].image_url || "/placeholder.svg"}
                    alt={blogPosts[currentIndex].title}
                    className="w-full object-cover transition-transform duration-300 hover:scale-105"
                    style={{ maxHeight: "200px" }}
                  />
                </div>
              )}
              <div className="flex-1 flex flex-col">
                <h2 className="text-2xl font-semibold mb-3 text-black">{blogPosts[currentIndex].title}</h2>
                <p className="text-gray-700 mb-4 flex-1 font-medium">{blogPosts[currentIndex].summary}</p>
                <div className="flex justify-between items-center mt-auto">
                  <span className="text-sm text-gray-500">
                    {new Date(blogPosts[currentIndex].created_at).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </span>
                  <Link
                    href={`/lifestyle/${blogPosts[currentIndex].id}`}
                    className="text-[#e76f51] hover:text-[#e76f51]/80 flex items-center font-semibold"
                  >
                    Read more <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="mt-4 flex justify-center">
        <div className="flex space-x-2">
          {blogPosts.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full ${index === currentIndex ? "bg-black" : "bg-black/30"}`}
              aria-label={`Go to article ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
