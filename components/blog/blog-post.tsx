"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
  // Function to format the content with proper paragraphs
  const formatContent = (content: string) => {
    return content.split("\n").map((paragraph, index) => (
      <p key={index} className="mb-4">
        {paragraph}
      </p>
    ))
  }

  return (
    <article className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
      <Link href="/blog" className="inline-flex items-center text-[#a8d1e7] hover:text-[#97c0d6] mb-6">
        <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
      </Link>

      <h1 className="text-3xl md:text-4xl font-bold mb-4 text-[#ffd6c0]">{post.title}</h1>

      <div className="text-gray-500 mb-8">
        {new Date(post.created_at).toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}
      </div>

      {post.image_url && (
        <div className="mb-8">
          <img src={post.image_url || "/placeholder.svg"} alt={post.title} className="w-full h-auto rounded-lg" />
        </div>
      )}

      <div className="prose max-w-none text-gray-800">{formatContent(post.content)}</div>
    </article>
  )
}
