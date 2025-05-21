"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Instagram } from "lucide-react"
import { supabase } from "@/utils/supabase"

export default function ConnectWithUsSection() {
  const [instagramUrl, setInstagramUrl] = useState("https://instagram.com/hai_designs_")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchInstagramUrl() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("site_settings").select("value").eq("key", "instagram_url").single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching Instagram URL:", error)
          return
        }

        if (data && data.value) {
          // Handle both string and JSON object formats
          let url
          if (typeof data.value === "string") {
            try {
              // Try to parse as JSON string first
              url = JSON.parse(data.value)
            } catch (e) {
              // If parsing fails, use as is
              url = data.value
            }
          } else {
            url = data.value
          }

          // Ensure the URL has a protocol
          if (url && typeof url === "string" && !url.startsWith("http")) {
            url = "https://" + url
          }

          setInstagramUrl(url || "https://instagram.com/hai_designs_")
        }
      } catch (error) {
        console.error("Unexpected error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchInstagramUrl()
  }, [])

  return (
    <section className="my-12 px-4 py-10 bg-gray-50 rounded-lg max-w-6xl mx-auto">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-4">show us your essentials.</h2>
        <p className="text-lg text-gray-700 mb-8">
          if you're ready to share your glow and show off your essentials. to the city, send us your content for
          featured consideration.
        </p>

        <Link
          href={instagramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center bg-black text-white py-3 px-8 md:py-4 md:px-10 rounded text-lg md:text-xl font-semibold hover:bg-gray-800 transition-colors no-tap-highlight"
          style={{
            WebkitTapHighlightColor: "transparent",
            outline: "none",
            textDecoration: "none",
          }}
        >
          <Instagram className="mr-2 h-5 w-5 text-white" />
          <span className="text-white">connect with us.</span>
        </Link>
      </div>
    </section>
  )
}
