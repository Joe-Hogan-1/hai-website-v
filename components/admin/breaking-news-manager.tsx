"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useBreakingNews } from "@/contexts/breaking-news-context"

export default function BreakingNewsManager() {
  const { newsText, setNewsText, updateBreakingNews, isLoading, error, debugInfo } = useBreakingNews()
  const [localText, setLocalText] = useState("")
  const [isSaving, setIsSaving] = useState(false)

  // Sync local state with context
  useEffect(() => {
    setLocalText(newsText)
  }, [newsText])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      setIsSaving(true)
      await updateBreakingNews(localText)
    } catch (err) {
      console.error("Error in form submission:", err)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Breaking News Manager</h2>

      <div className="bg-gray-100 p-4 rounded-md">
        <h3 className="font-medium mb-2">Current Status</h3>
        <p>
          <strong>Active News:</strong> {newsText ? "Yes" : "No"}
        </p>
        {newsText && (
          <p>
            <strong>Current Text:</strong> {newsText}
          </p>
        )}
        <p>
          <strong>Last Updated:</strong> {debugInfo.lastUpdate ? debugInfo.lastUpdate.toLocaleString() : "Never"}
        </p>
        <p>
          <strong>Connection Status:</strong>{" "}
          <span
            className={
              debugInfo.connectionStatus === "connected"
                ? "text-green-600"
                : debugInfo.connectionStatus === "error"
                  ? "text-red-600"
                  : "text-gray-600"
            }
          >
            {debugInfo.connectionStatus}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="breaking-news-text" className="block text-sm font-medium text-gray-700 mb-1">
            Breaking News Text
          </label>
          <textarea
            id="breaking-news-text"
            value={localText}
            onChange={(e) => setLocalText(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={3}
            placeholder="Enter breaking news text (leave empty to disable)"
          />
          <p className="text-sm text-gray-500 mt-1">
            Leave empty to disable breaking news. Text will be displayed in the breaking news banner.
          </p>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSaving || isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Breaking News"}
          </button>
        </div>

        {error && <div className="text-red-600">{error}</div>}
      </form>
    </div>
  )
}
