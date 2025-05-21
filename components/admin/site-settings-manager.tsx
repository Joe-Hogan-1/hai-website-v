"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"

export default function SiteSettingsManager() {
  const [instagramUrl, setInstagramUrl] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [message, setMessage] = useState({ text: "", type: "" })

  useEffect(() => {
    async function fetchSettings() {
      try {
        setIsLoading(true)
        const { data, error } = await supabase.from("site_settings").select("value").eq("key", "instagram_url").single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching Instagram URL:", error)
          return
        }

        if (data && data.value) {
          // Handle both string and JSON object formats
          if (typeof data.value === "string") {
            setInstagramUrl(data.value)
          } else if (typeof data.value === "object") {
            setInstagramUrl(data.value.toString())
          }
        }
      } catch (error) {
        console.error("Unexpected error:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleSave = async () => {
    try {
      setIsSaving(true)
      setMessage({ text: "", type: "" })

      // Check if the setting already exists
      const { data: existingData, error: checkError } = await supabase
        .from("site_settings")
        .select("*")
        .eq("key", "instagram_url")
        .single()

      if (checkError && checkError.code !== "PGRST116") {
        throw new Error("Error checking existing settings")
      }

      // Convert the URL to JSON format
      const jsonValue = JSON.stringify(instagramUrl)

      let result
      if (existingData) {
        // Update existing setting
        const { error: updateError } = await supabase
          .from("site_settings")
          .update({ value: jsonValue })
          .eq("key", "instagram_url")

        if (updateError) throw updateError
      } else {
        // Create new setting
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert([{ key: "instagram_url", value: jsonValue }])

        if (insertError) throw insertError
      }

      setMessage({ text: "Instagram URL saved successfully!", type: "success" })
    } catch (error) {
      console.error("Error saving Instagram URL:", error)
      setMessage({ text: "Error saving Instagram URL. Please try again.", type: "error" })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="p-4">Loading settings...</div>
  }

  return (
    <div className="p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-semibold mb-4">Social Media Settings</h2>

      <div className="mb-4">
        <label htmlFor="instagram-url" className="block text-sm font-medium text-gray-700 mb-1">
          Instagram URL
        </label>
        <input
          id="instagram-url"
          type="url"
          value={instagramUrl}
          onChange={(e) => setInstagramUrl(e.target.value)}
          placeholder="https://instagram.com/yourusername"
          className="w-full p-2 border border-gray-300 rounded focus:ring-black focus:border-black"
        />
        <p className="mt-1 text-sm text-gray-500">
          This URL will be used for the "Connect with us" button on the lifestyle page.
        </p>
      </div>

      <button
        onClick={handleSave}
        disabled={isSaving}
        className="bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors disabled:opacity-50 no-tap-highlight"
        style={{ WebkitTapHighlightColor: "transparent", outline: "none" }}
      >
        {isSaving ? "Saving..." : "Save Settings"}
      </button>

      {message.text && (
        <div
          className={`mt-4 p-2 rounded ${message.type === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
        >
          {message.text}
        </div>
      )}
    </div>
  )
}
