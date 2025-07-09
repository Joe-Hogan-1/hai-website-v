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
      <div className="w-full py-8 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  if (!text) {
    return null // Don't show anything if no text is available
  }

  return (
    <div class="w-full items-center text-center py-8 px-30">
      {text.title && <h2 className="text-2xl font-semibold mb-4">{text.title}</h2>}
      <div
        className="prose max-w-none whitespace-pre-wrap"
        dangerouslySetInnerHTML={{ __html: `<p>${formatTextAsHtml(text.content)}</p>` }}
      />
    </div>
  )
}
