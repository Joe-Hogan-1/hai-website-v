"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { usePathname } from "next/navigation"

export default function BreakingNewsBar() {
  const [newsText, setNewsText] = useState<string>("")
  const [loading, setLoading] = useState(true)
  const [shouldShow, setShouldShow] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    // Check if we should show the breaking news bar
    const checkIfShouldShow = () => {
      // Don't show on these specific pages
      if (pathname === "/user-agreement" || pathname === "/privacy-policy" || pathname === "/age-verification") {
        setShouldShow(false)
        return
      }

      // On homepage, only show if age verified
      if (pathname === "/") {
        const isAgeVerified = sessionStorage.getItem("ageVerified") === "true"
        setShouldShow(isAgeVerified)
        return
      }

      // Show on all other pages
      setShouldShow(true)
    }

    checkIfShouldShow()

    // Listen for storage events (in case age verification happens in another tab)
    const handleStorageChange = () => {
      checkIfShouldShow()
    }

    window.addEventListener("storage", handleStorageChange)
    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [pathname])

  useEffect(() => {
    // Only fetch news if we're going to show it
    if (!shouldShow) {
      setLoading(false)
      return
    }

    async function fetchBreakingNews() {
      try {
        const { data, error } = await supabase
          .from("breaking_news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          // Silent error handling
          return
        }

        if (data) {
          setNewsText(data.text)
        }
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false)
      }
    }

    fetchBreakingNews()

    // Subscribe to changes in the breaking_news table
    const channel = supabase
      .channel("breaking_news_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "breaking_news",
        },
        (payload) => {
          if (payload.new) {
            setNewsText((payload.new as any).text)
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [shouldShow])

  // Don't render anything if loading, no news text, or shouldn't show
  if (loading || !newsText || !shouldShow) {
    return null
  }

  return (
    <div className="bg-white py-2 w-full overflow-hidden fixed top-0 left-0 right-0 z-[60] shadow-md breaking-news-bar animate-fadeIn">
      <div className="marquee-container">
        <div className="marquee text-black">
          <span>{newsText}</span>
        </div>
      </div>
    </div>
  )
}
