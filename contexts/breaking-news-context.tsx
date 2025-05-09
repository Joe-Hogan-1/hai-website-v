"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/utils/supabase"
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
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1)
        .single()

      setDebugInfo((prev) => ({
        ...prev,
        lastFetch: new Date(),
        connectionStatus: error ? "error" : "connected",
      }))

      if (error) {
        if (error.code !== "PGRST116") {
          // PGRST116 is "no rows returned" error
          console.error("Error fetching breaking news:", error)
          setError(`Error fetching breaking news: ${error.message}`)
        } else {
          // No active breaking news found
          setNewsText("")
          setActiveNewsId(null)
          setError(null)
        }
      } else if (data) {
        console.log("Breaking news fetched successfully:", data)
        setNewsText(data.text)
        setActiveNewsId(data.id)
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
  }, [])

  // Set up subscription
  useEffect(() => {
    console.log("Setting up breaking news subscription...")

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
          console.log("Breaking news change detected:", payload)

          // Handle different types of changes
          if (payload.eventType === "INSERT" || payload.eventType === "UPDATE") {
            const newData = payload.new as BreakingNewsType
            if (newData.is_active) {
              setNewsText(newData.text)
              setActiveNewsId(newData.id)
            } else if (newData.id === activeNewsId) {
              // If our active news was deactivated
              setNewsText("")
              setActiveNewsId(null)
            }
          } else if (payload.eventType === "DELETE") {
            const oldData = payload.old as BreakingNewsType
            if (oldData.id === activeNewsId) {
              setNewsText("")
              setActiveNewsId(null)
            }
          }

          // Refresh data to ensure we have the latest
          fetchBreakingNews()
        },
      )
      .subscribe((status) => {
        console.log("Subscription status:", status)
      })

    return () => {
      console.log("Removing breaking news subscription...")
      supabase.removeChannel(channel)
    }
  }, [activeNewsId])

  const updateBreakingNews = async (text: string) => {
    try {
      console.log("Updating breaking news:", text)
      const newsText = text.trim()
      const isActive = newsText.length > 0

      setDebugInfo((prev) => ({
        ...prev,
        lastUpdate: new Date(),
      }))

      if (activeNewsId) {
        // If we have an active news item, update it
        console.log("Updating existing breaking news with ID:", activeNewsId)
        const { data, error } = await supabase
          .from("breaking_news")
          .update({
            text: newsText,
            is_active: isActive,
            updated_at: new Date().toISOString(),
          })
          .eq("id", activeNewsId)
          .select()

        if (error) {
          console.error("Error updating breaking news:", error)
          toast.error(`Failed to update: ${error.message}`)
          throw error
        }

        console.log("Breaking news updated successfully:", data)
        toast.success("Breaking news updated successfully")
      } else if (isActive) {
        // If we don't have an active news item but we have text, create a new one
        console.log("Creating new breaking news")
        const { data, error } = await supabase
          .from("breaking_news")
          .insert({
            text: newsText,
            is_active: true,
          })
          .select()

        if (error) {
          console.error("Error creating breaking news:", error)
          toast.error(`Failed to create: ${error.message}`)
          throw error
        }

        console.log("Breaking news created successfully:", data)
        if (data && data.length > 0) {
          setActiveNewsId(data[0].id)
          setNewsText(data[0].text)
        }
        toast.success("Breaking news created successfully")
      } else {
        console.log("No text provided, no action needed")
      }

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
