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
    summary?: string
  }
}

export default function BlogPost({ post }: BlogPostProps) {
  const [isImageLoaded, setIsImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  // Function to format the content with proper paragraphs
  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4 text-left">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className="max-w-5xl mx-auto bg-white/90 backdrop-blur-sm p-8 rounded-lg shadow-md blog-post-container">
      <Link href="/lifestyle" className="inline-flex items-center text-black hover:text-gray-700 mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
      </Link>

      <div className="blog-content" style={{ padding: 0, margin: 0 }}>
        <h1
          className="text-3xl md:text-4xl font-bold mb-3 text-black"
          style={{
            textAlign: "left",
            paddingLeft: 0,
            marginLeft: 0,
            padding: 0,
            margin: "0 0 12px 0",
          }}
        >
          {post.title}
        </h1>

        {post.summary && (
          <p
            className="text-lg text-gray-700 mb-6 font-medium"
            style={{
              textAlign: "left",
              paddingLeft: 0,
              marginLeft: 0,
              padding: 0,
              margin: "0 0 24px 0",
            }}
          >
            {post.summary}
          </p>
        )}

        <div
          className="text-gray-500 mb-8"
          style={{
            textAlign: "left",
            paddingLeft: 0,
            marginLeft: 0,
            padding: 0,
            margin: "0 0 32px 0",
          }}
        >
          {new Date(post.created_at).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </div>

        {post.image_url && (
          <div className="mb-8 relative w-full" style={{ margin: "0 0 32px 0", padding: 0 }}>
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

        <div
          className="prose max-w-none text-gray-800"
          style={{
            textAlign: "left",
            paddingLeft: 0,
            marginLeft: 0,
            padding: 0,
            margin: 0,
          }}
        >
          {formatContent(post.content)}
        </div>
      </div>
    </article>
  )
}
