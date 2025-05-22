"use client"

import { useState, useEffect } from "react"
import { supabase } from "./supabase"

export interface SiteSettings {
  isComingSoon: boolean
  comingSoonMessage: string
  isAgeGateEnabled: boolean
  isMaintenanceMode: boolean
  maintenanceMessage: string
  isLoading: boolean
}

// Default settings
const defaultSettings: SiteSettings = {
  isComingSoon: false,
  comingSoonMessage: "discover the intersection of wellness and a life well lived",
  isAgeGateEnabled: true,
  isMaintenanceMode: false,
  maintenanceMessage: "We're currently performing maintenance. Please check back soon.",
  isLoading: true,
}

// Cache the settings to avoid unnecessary fetches
let cachedSettings: SiteSettings | null = null
let lastFetchTime = 0
const CACHE_DURATION = 10000 // 10 seconds cache

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const now = Date.now()

  // Return cached settings if they exist and are fresh
  if (cachedSettings && now - lastFetchTime < CACHE_DURATION) {
    return cachedSettings
  }

  try {
    // Try to get settings from the database
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error) {
      console.error("Error fetching site settings:", error)
      return { ...defaultSettings, isLoading: false }
    }

    // Check if we have a specific coming_soon_mode setting
    const { data: comingSoonData, error: comingSoonError } = await supabase
      .from("site_settings")
      .select("value")
      .eq("key", "coming_soon_mode")
      .single()

    let isComingSoon = false
    let comingSoonMessage = defaultSettings.comingSoonMessage

    if (!comingSoonError && comingSoonData && comingSoonData.value) {
      isComingSoon = Boolean(comingSoonData.value.active)
      comingSoonMessage = comingSoonData.value.message || defaultSettings.comingSoonMessage
    }

    const settings: SiteSettings = {
      isComingSoon,
      comingSoonMessage,
      isAgeGateEnabled: data?.is_age_gate_enabled !== false, // Default to true if not specified
      isMaintenanceMode: data?.is_maintenance_mode || false,
      maintenanceMessage: data?.maintenance_message || defaultSettings.maintenanceMessage,
      isLoading: false,
    }

    // Update cache
    cachedSettings = settings
    lastFetchTime = now

    return settings
  } catch (error) {
    console.error("Error in fetchSiteSettings:", error)
    return { ...defaultSettings, isLoading: false }
  }
}

export function useSiteSettings(): SiteSettings {
  const [settings, setSettings] = useState<SiteSettings>({
    ...defaultSettings,
    isLoading: true,
  })

  useEffect(() => {
    let isMounted = true

    const loadSettings = async () => {
      try {
        const fetchedSettings = await fetchSiteSettings()
        if (isMounted) {
          setSettings(fetchedSettings)
        }
      } catch (error) {
        console.error("Error loading site settings:", error)
        if (isMounted) {
          setSettings({ ...defaultSettings, isLoading: false })
        }
      }
    }

    loadSettings()

    // Set up polling to check for settings changes
    const intervalId = setInterval(loadSettings, 10000) // Check every 10 seconds

    return () => {
      isMounted = false
      clearInterval(intervalId)
    }
  }, [])

  return settings
}

export async function updateSiteSettings(
  updates: Partial<SiteSettings>,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Handle coming soon mode separately
    if (updates.isComingSoon !== undefined || updates.comingSoonMessage !== undefined) {
      const value = {
        active: updates.isComingSoon,
        message: updates.comingSoonMessage || defaultSettings.comingSoonMessage,
      }

      const { error } = await supabase
        .from("site_settings")
        .upsert({ key: "coming_soon_mode", value }, { onConflict: "key" })

      if (error) throw error
    }

    // Convert from camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {}

    if (updates.isAgeGateEnabled !== undefined) dbUpdates.is_age_gate_enabled = updates.isAgeGateEnabled
    if (updates.isMaintenanceMode !== undefined) dbUpdates.is_maintenance_mode = updates.isMaintenanceMode
    if (updates.maintenanceMessage !== undefined) dbUpdates.maintenance_message = updates.maintenanceMessage

    // Only update the main settings if we have updates for them
    if (Object.keys(dbUpdates).length > 0) {
      // Get the current settings to update
      const { data: currentSettings, error: fetchError } = await supabase
        .from("site_settings")
        .select("id")
        .order("id", { ascending: false })
        .limit(1)
        .single()

      if (fetchError) {
        // If no settings exist, create a new record
        const { error: insertError } = await supabase.from("site_settings").insert([dbUpdates])

        if (insertError) throw insertError
      } else {
        // Update existing settings
        const { error: updateError } = await supabase
          .from("site_settings")
          .update(dbUpdates)
          .eq("id", currentSettings.id)

        if (updateError) throw updateError
      }
    }

    // Clear the cache to force a refresh
    cachedSettings = null

    return { success: true }
  } catch (error) {
    console.error("Error updating site settings:", error)
    return {
      success: false,
      error: error.message || "Failed to update site settings",
    }
  }
}

// Add this function to get coming soon status specifically
export async function getComingSoonStatus(): Promise<{ active: boolean; message: string }> {
  try {
    // Try to get from cache first
    if (cachedSettings) {
      return {
        active: cachedSettings.isComingSoon,
        message: cachedSettings.comingSoonMessage,
      }
    }

    // Bypass cache and fetch directly from database
    const { data, error } = await supabase.from("site_settings").select("value").eq("key", "coming_soon_mode").single()

    if (error) {
      console.error("Error getting coming soon status:", error)
      return { active: false, message: "" }
    }

    return {
      active: data?.value?.active || false,
      message: data?.value?.message || "",
    }
  } catch (error) {
    console.error("Error getting coming soon status:", error)
    return { active: false, message: "" }
  }
}
