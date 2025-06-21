"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { useState, useMemo } from "react"
import Image from "next/image"

interface BlogPostData {
  id: string
  title: string
  content: string
  image_url?: string | null
  created_at: string
  summary?: string
  embedded_image_url_1?: string | null
  embedded_image_url_2?: string | null
  embedded_image_url_3?: string | null
}

interface BlogPostProps {
  post: BlogPostData
}

export default function BlogPost({ post }: BlogPostProps) {
  const [mainImageLoaded, setMainImageLoaded] = useState(false)
  const [mainImageError, setMainImageError] = useState(false)

  const formattedContent = useMemo(() => {
    if (!post.content) return []

    const parts = post.content.split(/(\[EMBED_IMAGE_[1-3]\])/g).filter((part) => part.trim() !== "")

    return parts
      .map((part, index) => {
        const embedMatch = part.match(/^\[EMBED_IMAGE_([1-3])\]$/)
        if (embedMatch) {
          const imageIndex = Number.parseInt(embedMatch[1]) as 1 | 2 | 3
          const imageUrl = post[`embedded_image_url_${imageIndex}` as keyof BlogPostData] as string | null | undefined

          if (imageUrl) {
            return (
              <div key={`embed-${index}`} className="my-10 md:my-16 relative w-full aspect-video">
                <Image
                  src={imageUrl || "/placeholder.svg"}
                  alt={`Embedded image ${imageIndex} for ${post.title}`}
                  layout="fill"
                  objectFit="contain"
                  className="rounded-lg"
                />
              </div>
            )
          }
          return null
        }

        const paragraphs = part.split("\n").map((paragraph, pIndex) => (
          <p key={`p-${pIndex}`} className="mb-4 leading-relaxed">
            {paragraph}
          </p>
        ))

        return (
          <div key={`text-wrapper-${index}`} className="max-w-4xl mx-auto">
            {paragraphs}
          </div>
        )
      })
      .filter(Boolean)
  }, [post])

  return (
    <article className="max-w-7xl mx-auto bg-white/90 backdrop-blur-sm p-4 sm:p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/lifestyle" className="inline-flex items-center text-black hover:text-gray-700 mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to all posts
        </Link>
      </div>
      <div className="blog-content">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-bold text-black text-left">{post.title}</h1>
          {post.summary && <p className="text-lg text-gray-700 mb-6 font-medium text-left">{post.summary}</p>}
          <div className="text-gray-500 mb-8 text-left">
            {new Date(post.created_at).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>

        {post.image_url && (
          <div className="my-10 md:my-16 relative w-full aspect-[16/9]">
            {!mainImageError ? (
              <Image
                src={post.image_url || "/placeholder.svg"}
                alt={post.title}
                layout="fill"
                objectFit="contain"
                className={`rounded-lg transition-opacity duration-300 ${mainImageLoaded ? "opacity-100" : "opacity-0"}`}
                onLoadingComplete={() => setMainImageLoaded(true)}
                onError={() => {
                  setMainImageError(true)
                  setMainImageLoaded(true)
                }}
                priority
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
                <p className="text-gray-500">Main image could not be loaded</p>
              </div>
            )}
            {!mainImageLoaded && !mainImageError && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded-lg"></div>
            )}
          </div>
        )}

        <div className="prose max-w-none text-gray-800">{formattedContent}</div>
      </div>
    </article>
  )
}
