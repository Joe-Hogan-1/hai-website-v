"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { Megaphone, X } from "lucide-react"

export default function BreakingNewsManager() {
  const { newsText, updateBreakingNews, isLoading } = useBreakingNews()
  const [text, setText] = useState(newsText)
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!text.trim()) {
      toast.error("Breaking news text cannot be empty")
      return
    }

    setIsSaving(true)
    try {
      await updateBreakingNews(text.trim())
      toast.success("Breaking news updated successfully")
    } catch (error) {
      toast.error("Failed to update breaking news")
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
      toast.success("Breaking news removed")
    } catch (error) {
      toast.error("Failed to remove breaking news")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <div className="text-center py-4">Loading...</div>
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
    </Card>
  )
}
