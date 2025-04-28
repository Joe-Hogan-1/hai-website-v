"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { supabase } from "@/utils/supabase"

type BreakingNewsContextType = {
  newsText: string
  setNewsText: (text: string) => void
  updateBreakingNews: (text: string) => Promise<void>
  isLoading: boolean
}

const BreakingNewsContext = createContext<BreakingNewsContextType | undefined>(undefined)

export function BreakingNewsProvider({ children }: { children: ReactNode }) {
  const [newsText, setNewsText] = useState<string>("")
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchBreakingNews() {
      try {
        console.log("Fetching breaking news...")
        const { data, error } = await supabase
          .from("breaking_news")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(1)
          .single()

        if (error && error.code !== "PGRST116") {
          console.error("Error fetching breaking news:", error)
          // Error fetching breaking news
        } else if (data) {
          console.log("Breaking news fetched successfully:", data)
          setNewsText(data.text)
        } else {
          console.log("No breaking news found")
        }
      } catch (error) {
        console.error("Unexpected error fetching breaking news:", error)
        // Error fetching breaking news
      } finally {
        setIsLoading(false)
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
  }, [])

  const updateBreakingNews = async (text: string) => {
    try {
      console.log("Updating breaking news to:", text)

      // If the text is empty, we'll use an empty string
      const newsText = text.trim() || ""

      const { data, error } = await supabase
        .from("breaking_news")
        .upsert({ id: 1, text: newsText, created_at: new Date().toISOString() })
        .select()

      if (error) {
        console.error("Error updating breaking news:", error)
        throw error
      }

      console.log("Breaking news updated successfully:", data)
      setNewsText(newsText)
      return data
    } catch (error) {
      console.error("Failed to update breaking news:", error)
      throw error
    }
  }

  const value = {
    newsText,
    setNewsText,
    updateBreakingNews,
    isLoading,
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
