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
const CACHE_DURATION = 60000 // 1 minute cache

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const now = Date.now()

  // Return cached settings if they exist and are fresh
  if (cachedSettings && now - lastFetchTime < CACHE_DURATION) {
    return cachedSettings
  }

  try {
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

    const settings: SiteSettings = {
      isComingSoon: data.is_coming_soon || false,
      comingSoonMessage: data.coming_soon_message || defaultSettings.comingSoonMessage,
      isAgeGateEnabled: data.is_age_gate_enabled !== false, // Default to true if not specified
      isMaintenanceMode: data.is_maintenance_mode || false,
      maintenanceMessage: data.maintenance_message || defaultSettings.maintenanceMessage,
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
      const fetchedSettings = await fetchSiteSettings()
      if (isMounted) {
        setSettings(fetchedSettings)
      }
    }

    loadSettings()

    // Set up polling to check for settings changes
    const intervalId = setInterval(loadSettings, 30000) // Check every 30 seconds

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
    // Convert from camelCase to snake_case for database
    const dbUpdates: Record<string, any> = {}

    if (updates.isComingSoon !== undefined) dbUpdates.is_coming_soon = updates.isComingSoon
    if (updates.comingSoonMessage !== undefined) dbUpdates.coming_soon_message = updates.comingSoonMessage
    if (updates.isAgeGateEnabled !== undefined) dbUpdates.is_age_gate_enabled = updates.isAgeGateEnabled
    if (updates.isMaintenanceMode !== undefined) dbUpdates.is_maintenance_mode = updates.isMaintenanceMode
    if (updates.maintenanceMessage !== undefined) dbUpdates.maintenance_message = updates.maintenanceMessage

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
      const { error: updateError } = await supabase.from("site_settings").update(dbUpdates).eq("id", currentSettings.id)

      if (updateError) throw updateError
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
    const settings = await fetchSiteSettings()
    return {
      active: settings.isComingSoon,
      message: settings.comingSoonMessage,
    }
  } catch (error) {
    console.error("Error getting coming soon status:", error)
    return { active: false, message: "" }
  }
}
