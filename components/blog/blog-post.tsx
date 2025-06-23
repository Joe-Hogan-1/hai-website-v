"use client"

import Link from "next/link"
import { ArrowLeft, Facebook, Instagram, Twitter } from "lucide-react"
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

  const shareUrl = typeof window !== "undefined" ? window.location.href : ""
  const shareTitle = post.title
  const shareDescription = post.summary || post.title

  const handleFacebookShare = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const handleTwitterShare = () => {
    const text = `${shareTitle} - ${shareDescription}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(shareUrl)}`
    window.open(url, "_blank", "width=600,height=400")
  }

  const handleInstagramShare = () => {
    // Instagram doesn't have a direct web share API, so we'll copy the link to clipboard
    // and show a message to the user
    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(shareUrl)
        .then(() => {
          alert("Link copied to clipboard! You can now paste it in your Instagram story or bio.")
        })
        .catch(() => {
          alert(`Copy this link to share on Instagram: ${shareUrl}`)
        })
    } else {
      alert(`Copy this link to share on Instagram: ${shareUrl}`)
    }
  }

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
          <div className="flex items-center justify-between mb-8">
            <div className="text-gray-500 text-left">
              {new Date(post.created_at).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 font-medium">Share:</span>
              <div className="flex gap-2">
                <button
                  onClick={handleFacebookShare}
                  className="p-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-colors duration-200"
                  aria-label="Share on Facebook"
                >
                  <Facebook className="h-4 w-4" />
                </button>
                <button
                  onClick={handleTwitterShare}
                  className="p-2 rounded-full bg-black hover:bg-gray-800 text-white transition-colors duration-200"
                  aria-label="Share on X (Twitter)"
                >
                  <Twitter className="h-4 w-4" />
                </button>
                <button
                  onClick={handleInstagramShare}
                  className="p-2 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white transition-all duration-200"
                  aria-label="Share on Instagram"
                >
                  <Instagram className="h-4 w-4" />
                </button>
              </div>
            </div>
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
