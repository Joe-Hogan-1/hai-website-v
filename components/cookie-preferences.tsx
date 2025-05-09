"use client"

import { useState, useEffect } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { getCookie, setCookie } from "@/utils/cookies"
import { toast } from "sonner"

interface CookiePreferencesProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface CookiePreferences {
  essential: boolean
  analytics: boolean
  functional: boolean
  targeting: boolean
}

export default function CookiePreferences({ open, onOpenChange }: CookiePreferencesProps) {
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Essential cookies are always enabled
    analytics: true,
    functional: true,
    targeting: false,
  })

  // Load saved preferences when component mounts
  useEffect(() => {
    const savedPreferences = getCookie("cookie_preferences")
    if (savedPreferences) {
      try {
        const parsedPreferences = JSON.parse(savedPreferences)
        setPreferences({
          ...preferences,
          ...parsedPreferences,
          essential: true, // Essential cookies are always enabled
        })
      } catch (error) {
        console.error("Error parsing cookie preferences:", error)
      }
    } else {
      // If no preferences are saved, use the consent status
      const hasConsent = getCookie("cookie_consent") === "true"
      if (hasConsent) {
        setPreferences({
          essential: true,
          analytics: true,
          functional: true,
          targeting: false,
        })
      } else if (getCookie("cookie_consent") === "essential") {
        setPreferences({
          essential: true,
          analytics: false,
          functional: false,
          targeting: false,
        })
      }
    }
  }, [open])

  const handleSavePreferences = () => {
    // Save preferences to cookie
    setCookie("cookie_preferences", JSON.stringify(preferences), 365)

    // Update the main consent cookie based on preferences
    if (preferences.analytics || preferences.functional || preferences.targeting) {
      setCookie("cookie_consent", "true", 365)
    } else {
      setCookie("cookie_consent", "essential", 365)
    }

    toast.success("Cookie preferences saved")
    onOpenChange(false)
  }

  const handleAcceptAll = () => {
    const allEnabled = {
      essential: true,
      analytics: true,
      functional: true,
      targeting: true,
    }
    setPreferences(allEnabled)
    setCookie("cookie_preferences", JSON.stringify(allEnabled), 365)
    setCookie("cookie_consent", "true", 365)
    toast.success("All cookies accepted")
    onOpenChange(false)
  }

  const handleRejectAll = () => {
    const essentialOnly = {
      essential: true,
      analytics: false,
      functional: false,
      targeting: false,
    }
    setPreferences(essentialOnly)
    setCookie("cookie_preferences", JSON.stringify(essentialOnly), 365)
    setCookie("cookie_consent", "essential", 365)
    toast.success("Non-essential cookies rejected")
    onOpenChange(false)
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl">Cookie Preferences</SheetTitle>
          <SheetDescription>
            Manage your cookie preferences. Essential cookies are always enabled as they are necessary for the website
            to function properly.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Essential Cookies</h3>
                <p className="text-sm text-gray-500">
                  These cookies are necessary for the website to function properly. They cannot be disabled.
                </p>
              </div>
              <Switch checked={preferences.essential} disabled className="cookie-switch" />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Analytics Cookies</h3>
                <p className="text-sm text-gray-500">
                  These cookies help us understand how visitors interact with our website by collecting and reporting
                  information anonymously.
                </p>
              </div>
              <Switch
                id="analytics"
                checked={preferences.analytics}
                onCheckedChange={(checked) => setPreferences({ ...preferences, analytics: checked })}
                className="cookie-switch"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Functional Cookies</h3>
                <p className="text-sm text-gray-500">
                  These cookies enable the website to provide enhanced functionality and personalization.
                </p>
              </div>
              <Switch
                id="functional"
                checked={preferences.functional}
                onCheckedChange={(checked) => setPreferences({ ...preferences, functional: checked })}
                className="cookie-switch"
              />
            </div>

            <Separator />

            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium">Targeting Cookies</h3>
                <p className="text-sm text-gray-500">
                  These cookies may be set through our site by our advertising partners to build a profile of your
                  interests.
                </p>
              </div>
              <Switch
                id="targeting"
                checked={preferences.targeting}
                onCheckedChange={(checked) => setPreferences({ ...preferences, targeting: checked })}
                className="cookie-switch"
              />
            </div>
          </div>

          <div className="flex flex-col space-y-2 mt-8">
            <Button onClick={handleSavePreferences} className="cookie-button">
              Save Preferences
            </Button>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="outline" onClick={handleAcceptAll} className="cookie-button-outline">
                Accept All
              </Button>
              <Button variant="outline" onClick={handleRejectAll} className="cookie-button-outline">
                Essential Only
              </Button>
            </div>
          </div>

          <div className="text-xs text-gray-500 mt-4">
            <p>
              For more information about how we use cookies, please see our{" "}
              <a href="/privacy-policy" className="text-black hover:underline">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
