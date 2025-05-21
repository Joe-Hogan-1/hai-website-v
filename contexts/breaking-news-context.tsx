"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { toast } from "sonner"

type BreakingNewsType = {
  id: number
  text: string
  is_active: boolean
  created_at: string
  updated_at: string
}

type BreakingNewsContextType = {
  newsText: string
  setNewsText: (text: string) => void
  updateBreakingNews: (text: string) => Promise<void>
  isLoading: boolean
  error: string | null
  debugInfo: {
    lastFetch: Date | null
    lastUpdate: Date | null
    connectionStatus: "unknown" | "connected" | "error"
  }
}

const BreakingNewsContext = createContext<BreakingNewsContextType | undefined>(undefined)

export function BreakingNewsProvider({ children }: { children: ReactNode }) {
  const [newsText, setNewsText] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeNewsId, setActiveNewsId] = useState<number | null>(null)
  const [debugInfo, setDebugInfo] = useState({
    lastFetch: null as Date | null,
    lastUpdate: null as Date | null,
    connectionStatus: "unknown" as "unknown" | "connected" | "error",
  })

  // Function to fetch breaking news
  const fetchBreakingNews = async () => {
    try {
      console.log("Fetching breaking news...")
      setIsLoading(true)

      // Use fetch API directly instead of Supabase client
      const response = await fetch("/api/breaking-news")

      if (!response.ok) {
        throw new Error(`Error fetching breaking news: ${response.statusText}`)
      }

      const data = await response.json()

      setDebugInfo((prev) => ({
        ...prev,
        lastFetch: new Date(),
        connectionStatus: "connected",
      }))

      if (data && data.text) {
        console.log("Breaking news fetched successfully:", data)
        setNewsText(data.text)
        setActiveNewsId(data.id)
        setError(null)
      } else {
        // No active breaking news found
        setNewsText("")
        setActiveNewsId(null)
        setError(null)
      }
    } catch (err: any) {
      console.error("Unexpected error fetching breaking news:", err)
      setError(`Unexpected error: ${err.message || "Unknown error"}`)
      setDebugInfo((prev) => ({
        ...prev,
        connectionStatus: "error",
      }))
    } finally {
      setIsLoading(false)
    }
  }

  // Initial fetch
  useEffect(() => {
    fetchBreakingNews()

    // Set up polling instead of realtime subscription
    const intervalId = setInterval(() => {
      fetchBreakingNews()
    }, 30000) // Poll every 30 seconds

    return () => {
      clearInterval(intervalId)
    }
  }, [])

  const updateBreakingNews = async (text: string) => {
    try {
      console.log("Updating breaking news:", text)
      const newsText = text.trim()
      const isActive = text.length > 0

      setDebugInfo((prev) => ({
        ...prev,
        lastUpdate: new Date(),
      }))

      // Use fetch API directly instead of Supabase client
      const response = await fetch("/api/breaking-news", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: activeNewsId,
          text: newsText,
          is_active: isActive,
        }),
      })

      if (!response.ok) {
        throw new Error(`Error updating breaking news: ${response.statusText}`)
      }

      const data = await response.json()

      if (data.error) {
        console.error("Error updating breaking news:", data.error)
        toast.error(`Failed to update: ${data.error}`)
        throw new Error(data.error)
      }

      console.log("Breaking news updated successfully:", data)

      if (data.id) {
        setActiveNewsId(data.id)
        setNewsText(data.text)
      }

      toast.success("Breaking news updated successfully")

      // Refresh data to ensure we have the latest
      fetchBreakingNews()
    } catch (err: any) {
      console.error("Unexpected error updating breaking news:", err)
      setError(`Unexpected error: ${err.message || "Unknown error"}`)
      throw err
    }
  }

  const value = {
    newsText,
    setNewsText,
    updateBreakingNews,
    isLoading,
    error,
    debugInfo,
  }

  return <BreakingNewsContext.Provider value={value}>{children}</BreakingNewsContext.Provider>
}

export const useBreakingNews = () => {
  const context = useContext(BreakingNewsContext)
  if (context === undefined) {
    throw new Error("useBreakingNews must be used within a BreakingNewsProvider")
  }
  return context
}
