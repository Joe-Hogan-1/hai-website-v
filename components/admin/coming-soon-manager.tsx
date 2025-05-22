"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { useSiteSettings, updateSiteSettings } from "@/utils/site-settings"

export default function ComingSoonManager() {
  const siteSettings = useSiteSettings()
  const [isComingSoon, setIsComingSoon] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Use the site settings hook instead of direct API calls
  useEffect(() => {
    if (!siteSettings.isLoading) {
      setIsComingSoon(siteSettings.isComingSoon)
      setMessage(siteSettings.comingSoonMessage)
      setIsLoading(false)
    }
  }, [siteSettings])

  const saveComingSoonStatus = async () => {
    try {
      setIsSaving(true)
      setError(null)

      // Use the utility function instead of direct API call
      const result = await updateSiteSettings({
        isComingSoon,
        comingSoonMessage: message.trim(),
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to save settings")
      }

      toast.success(`Coming soon mode ${isComingSoon ? "enabled" : "disabled"} successfully`)
    } catch (err: any) {
      console.error("Error saving coming soon status:", err)
      setError(err.message || "Failed to save coming soon settings")
      toast.error(err.message || "Failed to save coming soon settings")
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleChange = (checked: boolean) => {
    setIsComingSoon(checked)
  }

  const handleMessageChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    saveComingSoonStatus()
  }

  if (isLoading) {
    return <div className="p-4">Loading coming soon settings...</div>
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-2xl font-bold">Coming Soon Mode</h2>

      {isComingSoon && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4" role="alert">
          <p className="font-bold">Coming Soon Mode is Active</p>
          <p>Your site is currently in coming soon mode. Only authenticated users can access it.</p>
        </div>
      )}

      {error && (
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4" role="alert">
          <p className="font-bold">Error</p>
          <p>{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center space-x-2">
          <Switch id="coming-soon-mode" checked={isComingSoon} onCheckedChange={handleToggleChange} />
          <Label htmlFor="coming-soon-mode">Enable Coming Soon Mode</Label>
        </div>

        <div className="space-y-2">
          <Label htmlFor="coming-soon-message">Coming Soon Message</Label>
          <Textarea
            id="coming-soon-message"
            placeholder="Enter a message to display on the coming soon page"
            value={message}
            onChange={handleMessageChange}
            rows={4}
          />
        </div>

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          disabled={isSaving}
        >
          {isSaving ? "Saving..." : "Save Settings"}
        </button>
      </form>
    </div>
  )
}
