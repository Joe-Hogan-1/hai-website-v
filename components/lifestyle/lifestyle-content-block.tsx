"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

interface LifestyleContent {
  id: string
  title?: string
  content: string
}

export default function LifestyleContentBlock() {
  const [content, setContent] = useState<LifestyleContent | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("lifestyle_content")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          // PGRST116 is the error code for no rows returned
          console.error("Error fetching lifestyle content:", error)
          setContent(null)
        } else {
          setContent(data || null)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setContent(null)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="w-full py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!content) {
    return null // Don't show anything if no content is available
  }

  return (
    <div className="w-full py-6">
      {content.title && <h2 className="text-2xl font-semibold mb-4 text-left">{content.title}</h2>}
      <div className="prose max-w-none text-left" dangerouslySetInnerHTML={{ __html: content.content }} />
    </div>
  )
}
