"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { X, ChevronDown, ChevronUp } from "lucide-react"
import { setCookie, getCookie } from "@/utils/cookies"
import { storeUserData } from "@/utils/user-data"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

export default function CookieConsent() {
  const [isVisible, setIsVisible] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    // Check if user has already given consent or set preferences
    const hasConsent = getCookie("cookie_consent")
    const hasPreferences = getCookie("cookie_preferences")

    if (!hasConsent && !hasPreferences) {
      // Show the consent banner if no consent or preferences have been set
      setIsVisible(true)
    }
  }, [])

  const handleAccept = async () => {
    setIsLoading(true)
    try {
      // Set consent cookie (expires in 365 days)
      setCookie("cookie_consent", "true", 365)

      // Set default preferences
      const defaultPreferences = {
        essential: true,
        analytics: true,
        functional: true,
        targeting: false,
      }
      setCookie("cookie_preferences", JSON.stringify(defaultPreferences), 365)

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

  const handleAcceptEssential = () => {
    // Set minimal consent cookie (expires in 30 days)
    setCookie("cookie_consent", "essential", 30)

    // Set preferences with only essential cookies enabled
    const essentialPreferences = {
      essential: true,
      analytics: false,
      functional: false,
      targeting: false,
    }
    setCookie("cookie_preferences", JSON.stringify(essentialPreferences), 30)

    setIsVisible(false)
  }

  const handleDecline = () => {
    // Set no consent cookie (expires in 30 days)
    setCookie("cookie_consent", "false", 30)

    // Set preferences with only essential cookies enabled
    const essentialPreferences = {
      essential: true,
      analytics: false,
      functional: false,
      targeting: false,
    }
    setCookie("cookie_preferences", JSON.stringify(essentialPreferences), 30)

    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg z-50 border-t border-gray-200">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">We Value Your Privacy</h3>
            <p className="text-sm text-gray-600 mb-2">
              We use cookies and similar technologies to enhance your browsing experience, analyze site traffic, and
              personalize content.
            </p>

            <div className="mb-4">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="text-[#a8d1e7] hover:text-[#97c0d6] text-sm flex items-center"
              >
                {showDetails ? <ChevronUp className="h-4 w-4 mr-1" /> : <ChevronDown className="h-4 w-4 mr-1" />}
                {showDetails ? "Hide details" : "View cookie details"}
              </button>
            </div>

            {showDetails && (
              <Accordion type="single" collapsible className="w-full mb-4 bg-gray-50 rounded-md p-2">
                <AccordionItem value="essential">
                  <AccordionTrigger className="text-sm font-medium">Essential Cookies</AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600">
                    These cookies are necessary for the website to function properly. They enable basic functions like
                    page navigation and access to secure areas of the website.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="analytics">
                  <AccordionTrigger className="text-sm font-medium">Analytics Cookies</AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600">
                    These cookies help us understand how visitors interact with our website. They provide information
                    about metrics such as page views, time spent on pages, navigation paths, device information, and
                    geographic location.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="functional">
                  <AccordionTrigger className="text-sm font-medium">Functional Cookies</AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600">
                    These cookies enable enhanced functionality and personalization. They may be set by us or by
                    third-party providers whose services we have added to our pages.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="targeting">
                  <AccordionTrigger className="text-sm font-medium">Targeting Cookies</AccordionTrigger>
                  <AccordionContent className="text-xs text-gray-600">
                    These cookies may be set through our site by our advertising partners to build a profile of your
                    interests and show you relevant advertisements on other sites.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
          </div>
          <div className="flex flex-col gap-2 w-full md:w-auto">
            <Button
              onClick={handleAccept}
              className="bg-[#ffd6c0] hover:bg-[#ffcbb0] whitespace-nowrap w-full text-black"
              disabled={isLoading}
            >
              {isLoading ? "Processing..." : "Accept All Cookies"}
            </Button>
            <Button variant="outline" onClick={handleAcceptEssential} className="whitespace-nowrap w-full">
              Essential Cookies Only
            </Button>
            <Button variant="ghost" onClick={handleDecline} className="whitespace-nowrap w-full text-gray-500">
              Decline All
            </Button>
          </div>
        </div>
        <div className="mt-2 text-xs text-gray-500">
          <p>
            By clicking "Accept All Cookies", you agree to the storing of cookies on your device to enhance site
            navigation, analyze site usage, and assist in our marketing efforts. For more information, please visit our{" "}
            <a href="/privacy-policy" className="underline hover:text-gray-700">
              Privacy Policy
            </a>
            .
          </p>
        </div>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 md:hidden"
        aria-label="Close cookie consent"
      >
        <X size={20} />
      </button>
    </div>
  )
}
