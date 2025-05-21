"use client"

import { useState, useEffect } from "react"
import { createClient } from "@supabase/supabase-js"
import { Textarea } from "@/components/ui/textarea"

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default function SecondaryTextManager() {
  const [id, setId] = useState<string | null>(null)
  const [title, setTitle] = useState("Our Philosophy")
  const [content, setContent] = useState(
    "At hai, we believe in creating products that enhance your everyday experiences. Our carefully crafted items are designed to bring balance and joy to your life, whether you're starting your day or winding down in the evening.",
  )
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState("")

  useEffect(() => {
    async function fetchContent() {
      setLoading(true)
      try {
        const { data, error } = await supabase
          .from("secondary_text")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error) {
          console.log("Error fetching secondary text content:", error)
          return
        }

        if (data) {
          setId(data.id)
          setTitle(data.title || "")
          setContent(data.content || "")
        }
      } catch (error) {
        console.error("Error in fetchContent:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setMessage("")

    try {
      let response

      if (id) {
        // Update existing content
        response = await fetch("/api/secondary-text", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            id,
            title,
            content,
          }),
        })
      } else {
        // Create new content
        response = await fetch("/api/secondary-text", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            content,
          }),
        })
      }

      if (!response.ok) {
        throw new Error("Failed to save content")
      }

      const data = await response.json()
      setId(data.id)
      setMessage("Content saved successfully!")
    } catch (error) {
      console.error("Error saving content:", error)
      setMessage("Error saving content. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Secondary Text Block (Bottom)</h2>
      <p className="text-gray-500">Edit the text content that appears below the vertical image carousel.</p>

      <div className="space-y-4">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title
          </label>
          <input
            id="title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter title"
          />
        </div>

        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            Content
          </label>
          <Textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 min-h-[200px]"
            placeholder="Enter content"
          />
          <p className="text-xs text-gray-500 mt-1">Use line breaks to separate paragraphs.</p>
        </div>

        <div className="flex items-center justify-between">
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>

          {message && (
            <p className={`text-sm ${message.includes("Error") ? "text-red-500" : "text-green-500"}`}>{message}</p>
          )}
        </div>
      </div>

      <div className="mt-8 border-t pt-6">
        <h3 className="text-lg font-medium mb-4">Preview</h3>
        <div className="border p-6 rounded-md">
          <h2 className="text-3xl font-semibold mb-4">{title}</h2>
          <div className="prose max-w-none">
            {content.split("\n").map((paragraph, index) => (
              <p key={index} className="mb-4 text-gray-700">
                {paragraph}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
