"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"

interface ComingSoonManagerProps {
  userId: string
}

export default function ComingSoonManager({ userId }: ComingSoonManagerProps) {
  const [isActive, setIsActive] = useState(false)
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle")

  useEffect(() => {
    async function loadSettings() {
      try {
        // Get coming soon status directly from the database
        const { data, error } = await supabase
          .from("site_settings")
          .select("value")
          .eq("key", "coming_soon_mode")
          .single()

        if (error) {
          console.error("Error loading coming soon settings:", error)
          return
        }

        if (data && data.value) {
          setIsActive(data.value.active || false)
          setMessage(data.value.message || "")
        }
      } catch (error) {
        console.error("Error loading coming soon settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [])

  async function handleSaveSettings() {
    setIsSaving(true)
    setSaveStatus("idle")

    try {
      // Get current settings
      const { data: currentSettings, error: fetchError } = await supabase
        .from("site_settings")
        .select("id")
        .eq("key", "coming_soon_mode")
        .single()

      const comingSoonValue = {
        active: isActive,
        message: message,
      }

      if (fetchError || !currentSettings) {
        // If no settings exist, create a new record
        const { error: insertError } = await supabase
          .from("site_settings")
          .insert([{ key: "coming_soon_mode", value: comingSoonValue }])

        if (insertError) throw insertError
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("site_settings")
          .update({ value: comingSoonValue })
          .eq("id", currentSettings.id)

        if (updateError) throw updateError
      }

      setSaveStatus("success")
    } catch (error) {
      console.error("Error saving coming soon settings:", error)
      setSaveStatus("error")
    } finally {
      setIsSaving(false)

      // Reset status after 3 seconds
      setTimeout(() => {
        setSaveStatus("idle")
      }, 3000)
    }
  }

  if (isLoading) {
    return <div className="animate-pulse p-4">Loading settings...</div>
  }

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Coming Soon Mode</h2>

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-medium">Coming Soon Mode</h3>
            <p className="text-gray-600 text-sm">
              When active, visitors will see a coming soon overlay with an email signup form
            </p>
          </div>

          <Switch checked={isActive} onCheckedChange={setIsActive} className="data-[state=checked]:bg-[#ffd6c0]" />
        </div>

        {isActive && (
          <div className="bg-amber-50 border border-amber-200 p-4 rounded-md flex items-start gap-3">
            <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-800">Coming Soon Mode is Active</h4>
              <p className="text-amber-700 text-sm mt-1">
                Your website is currently in coming soon mode. Only authenticated users can access the site.
              </p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="coming-soon-message">Message (optional)</Label>
          <Textarea
            id="coming-soon-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter a custom message to display on the coming soon page"
            rows={3}
            className="resize-none w-full"
          />
          <p className="text-xs text-gray-500">
            Leave blank to use the default message: "discover the intersection of wellness and a life well lived"
          </p>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div>
            {saveStatus === "success" && <span className="text-green-600">Settings saved successfully!</span>}
            {saveStatus === "error" && <span className="text-red-600">Error saving settings. Please try again.</span>}
          </div>

          <button
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="bg-[#ffd6c0] text-black py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all font-medium disabled:opacity-50"
          >
            {isSaving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  )
}
