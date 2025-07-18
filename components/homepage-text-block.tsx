"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

interface HomepageText {
  id: string
  title?: string
  content: string
}

export default function HomepageTextBlock() {
  const [text, setText] = useState<HomepageText | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchText() {
      try {
        setLoading(true)
        const { data, error } = await supabase
          .from("homepage_text")
          .select("*")
          .eq("is_active", true)
          .order("updated_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching homepage text:", error)
          setText(null)
        } else {
          setText(data || null)
        }
      } catch (error) {
        console.error("Unexpected error:", error)
        setText(null)
      } finally {
        setLoading(false)
      }
    }

    fetchText()
  }, [])

  // Enhanced function to convert text to HTML while preserving whitespace and formatting
  function formatTextAsHtml(text: string) {
    // First, preserve line breaks and indentation
    const html = text
      // Replace double line breaks with paragraph tags
      .replace(/\n\n/g, "</p><p>")
      // Replace single line breaks with <br> tags
      .replace(/\n/g, "<br>")
      // Preserve indentation by replacing spaces with non-breaking spaces
      .replace(/( {2,})/g, (match) => {
        return "&nbsp;".repeat(match.length)
      })
      // Replace tabs with non-breaking spaces
      .replace(/\t/g, "&nbsp;&nbsp;&nbsp;&nbsp;")
      // Handle basic formatting
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/^### (.*?)$/gm, "<h3>$1</h3>")
      .replace(/^## (.*?)$/gm, "<h2>$1</h2>")
      .replace(/^# (.*?)$/gm, "<h1>$1</h1>")

    return html
  }

  if (loading) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
        <div className="text-center">
          <div className="h-6 bg-gray-200 rounded w-1/3 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
        </div>
      </div>
    )
  }

  if (!text) {
    return null // Don't show anything if no text is available
  }

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        {text.title && <h2 className="text-2xl sm:text-3xl md:text-4xl font-semibold mb-4">{text.title}</h2>}
        <div
          className="prose prose-lg max-w-none mx-auto text-base sm:text-lg md:text-xl leading-relaxed whitespace-pre-wrap"
          dangerouslySetInnerHTML={{ __html: `<p>${formatTextAsHtml(text.content)}</p>` }}
        />
      </div>
    </div>
  )
}
