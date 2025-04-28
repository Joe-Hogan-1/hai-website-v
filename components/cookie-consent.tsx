"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X } from "lucide-react"
import { setCookie, getCookie } from "@/utils/cookies"
import { storeUserData } from "@/utils/user-data"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if user has already given consent
    const hasConsent = getCookie("cookie_consent")
    if (!hasConsent) {
      // Show the consent banner if no consent has been given
      setIsVisible(true)
    }
  }, [])

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      // Set consent cookie (expires in 365 days)
      setCookie("cookie_consent", "true", 365)

      // Generate a unique user ID if not already set
      let userId = getCookie("user_id")
      if (!userId) {
        userId = `user_${Math.random().toString(36).substring(2, 15)}`
        setCookie("user_id", userId, 365)
      }

      // Try to store the data, but don't block the UI if it fails
      storeUserData({
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
      }).catch((error) => {
        console.error("Failed to store consent data, but continuing:", error)
      })

      // Hide the consent banner
      setIsVisible(false)
    } catch (error) {
      console.error("Error in cookie consent:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDecline = () => {
    // Set minimal consent cookie (expires in 30 days)
    setCookie("cookie_consent", "false", 30)
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold mb-1">We Value Your Privacy</h3>
          <p className="text-sm text-gray-600">
            We use cookies to enhance your browsing experience, serve personalized ads or content, and analyze our
            traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleDecline} className="whitespace-nowrap">
            Decline
          </Button>
          <Button
            onClick={handleAccept}
            className="bg-[#ffd6c0] hover:bg-[#ffcbb0] whitespace-nowrap"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Accept All"}
          </Button>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 md:hidden"
          aria-label="Close cookie consent"
        >
          <X size={20} />
        </button>
      </div>
    </div>
  )
}
