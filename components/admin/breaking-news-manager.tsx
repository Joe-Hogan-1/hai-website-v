"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { Megaphone, X, AlertCircle, RefreshCw } from "lucide-react"

export default function BreakingNewsManager() {
  const { newsText, updateBreakingNews, isLoading, error, debugInfo } = useBreakingNews()
  const [text, setText] = useState(newsText)
  const [isSaving, setIsSaving] = useState(false)

  // Update local state when context changes
  useEffect(() => {
    setText(newsText)
  }, [newsText])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await updateBreakingNews(text)
    } catch (error) {
      // Error is already handled in the context
      console.error("Error in handleSave:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClear = async () => {
    if (!confirm("Are you sure you want to remove the breaking news?")) return

    setIsSaving(true)
    try {
      await updateBreakingNews("")
      setText("")
    } catch (error) {
      // Error is already handled in the context
      console.error("Error in handleClear:", error)
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center py-4">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading breaking news...</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Megaphone className="mr-2 h-5 w-5" /> Breaking News
        </CardTitle>
        <p className="text-sm text-gray-500">
          Add text here to display a scrolling announcement at the top of all pages. Leave empty to remove the
          announcement.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md flex items-start">
              <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium">Error</p>
                <p className="text-sm">{error}</p>
              </div>
            </div>
          )}

          <div>
            <label htmlFor="breaking-news" className="block text-sm font-medium text-gray-700 mb-1">
              Breaking News Text
            </label>
            <Input
              id="breaking-news"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter breaking news text here..."
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              This text will appear in a scrolling bar at the top of all pages.
            </p>
          </div>

          <div className="flex justify-between">
            <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]" disabled={isSaving}>
              {isSaving ? "Saving..." : text.trim() ? "Update Breaking News" : "Save Breaking News"}
            </Button>
            {newsText && (
              <Button
                onClick={handleClear}
                variant="outline"
                className="text-red-500 hover:text-red-700"
                disabled={isSaving}
              >
                <X className="mr-1 h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 text-xs text-gray-500">
        <div className="w-full">
          <p>
            Connection status:{" "}
            <span className={debugInfo.connectionStatus === "connected" ? "text-green-600" : "text-red-600"}>
              {debugInfo.connectionStatus}
            </span>
          </p>
          {debugInfo.lastFetch && <p>Last fetch: {debugInfo.lastFetch.toLocaleTimeString()}</p>}
          {debugInfo.lastUpdate && <p>Last update attempt: {debugInfo.lastUpdate.toLocaleTimeString()}</p>}
        </div>
      </CardFooter>
    </Card>
  )
}
