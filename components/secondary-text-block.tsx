"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SecondaryTextBlock() {
  const [title, setTitle] = useState("Our Philosophy")
  const [content, setContent] = useState(
    "At hai, we believe in creating products that enhance your everyday experiences. Our carefully crafted items are designed to bring balance and joy to your life, whether you're starting your day or winding down in the evening.",
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchContent() {
      try {
        const { data, error } = await supabase
          .from("secondary_text")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.log("Error fetching secondary text content:", error)
          setLoading(false)
          return
        }

        if (data) {
          setTitle(data.title || "Our Philosophy")
          setContent(
            data.content ||
              "At hai, we believe in creating products that enhance your everyday experiences. Our carefully crafted items are designed to bring balance and joy to your life, whether you're starting your day or winding down in the evening.",
          )
        }
      } catch (error) {
        console.error("Error in fetchContent:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  if (loading) {
    return (
      <div className="animate-pulse px-4 md:px-0">
        <div className="h-6 md:h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4 px-4 md:px-10">

    <div className="space-y-4 px-4 md:px-0">

      <h2 className="text-2xl md:text-3xl font-semibold leading-tight">{title}</h2>
      <div className="prose max-w-none">
        {content.split("\n").map((paragraph, index) => (
          <p key={index} className="mb-4 text-base md:text-lg text-gray-700 leading-relaxed">
            {paragraph}
          </p>
        ))}
      </div>
    </div>
  )
}
