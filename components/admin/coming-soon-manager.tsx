"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"

export default function ComingSoonManager() {
  const [isComingSoon, setIsComingSoon] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    fetchComingSoonStatus()
  }, [])

  const fetchComingSoonStatus = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/site-settings?key=coming_soon_mode")

      if (!response.ok) {
        throw new Error(`Error fetching coming soon status: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.value) {
        setIsComingSoon(data.value.active || false)
        setMessage(data.value.message || "")
      } else {
        setIsComingSoon(false)
        setMessage("")
      }
    } catch (error) {
      console.error("Error fetching coming soon status:", error)
      toast.error("Failed to load coming soon settings")
    } finally {
      setIsLoading(false)
    }
  }

  const saveComingSoonStatus = async () => {
    try {
      setIsSaving(true)

      const response = await fetch("/api/site-settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          key: "coming_soon_mode",
          value: {
            active: isComingSoon,
            message: message.trim(),
          },
        }),
      })

      if (!response.ok) {
        throw new Error(`Error saving coming soon status: ${response.statusText}`)
      }

      toast.success("Coming soon settings saved successfully")
    } catch (error) {
      console.error("Error saving coming soon status:", error)
      toast.error("Failed to save coming soon settings")
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
