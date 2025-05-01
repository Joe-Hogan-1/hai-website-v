"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState } from "react"

interface BlogPostProps {
  post: {
    id: string
    title: string
    content: string
    image_url?: string
    created_at: string
  }
}

export default function BlogPost({ post }: BlogPostProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Function to format the content with proper paragraphs
  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className="max-w-3xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md">
      <Link href="/blog" className="inline-flex items-center text-[#a8d1e7] hover:text-[#97c0d6] mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-black">{post.title}</h1>

      <div className="text-gray-500 mb-8">
        {new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {post.image_url && (
        <div className="mb-8 relative w-1/2 mx-auto">
          <img
            src={post.image_url || "/placeholder.svg"}
            alt={post.title}
            className={`w-full h-auto rounded-lg transition-opacity duration-300 ${
              isImageLoaded ? "opacity-100" : "opacity-0"
            }`}
            onLoad={() => setIsImageLoaded(true)}
            onError={() => {
              setImageError(true)
              setIsImageLoaded(true)
            }}
          />
          {!isImageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>}
          {imageError && (
            <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center">
              <p className="text-gray-500">Image could not be loaded</p>
            </div>
          )}
        </div>
      )}

      <div className="prose max-w-none text-gray-800">{formatContent(post.content)}</div>
    </article>
  )
}
