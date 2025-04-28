import { supabase } from "@/utils/supabase"
import { getAllUserData, getCookie, setCookie } from "@/utils/cookies"

/**
 * Store user data in Supabase
 */
export async function storeUserData(additionalData: Record<string, any> = {}) {
  try {
    // Get all user data from cookies
    const userData = getAllUserData()

    // Ensure we have a user_id
    if (!userData.user_id) {
      const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`
      setCookie("user_id", newUserId, 365)
      userData.user_id = newUserId
    }

    // Merge with additional data
    const dataToStore = {
      ...userData,
      ...additionalData,
      updated_at: new Date().toISOString(),
    }

    // Use a service role key or enable anonymous inserts for this table
    // For this example, we'll use a public insert approach with minimal data
    const { error } = await supabase.from("user_data").insert({
      user_id: dataToStore.user_id,
      data: {
        consent_given: dataToStore.cookie_consent === "true",
        consent_timestamp: dataToStore.updated_at,
        // Only include non-sensitive data
        language: navigator.language,
        screen_size: `${window.screen.width}x${window.screen.height}`,
        // Don't include full user agent for privacy
        browser: navigator.userAgent.split(" ")[0],
      },
    })

    if (error) {
      console.error("Supabase insert error:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing user data:", error)
    return { success: false, error }
  }
}

/**
 * Track a page view and store in Supabase
 */
export async function trackPageViewInSupabase(path: string) {
  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Insert the page view - we'll use a simpler approach without foreign keys
    const { error } = await supabase.from("page_views").insert({
      user_id: userId,
      path,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || "direct",
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error tracking page view:", error)
    return { success: false, error }
  }
}

/**
 * Track an age verification event
 */
export async function trackAgeVerification(verified: boolean) {
  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Insert the age verification
    const { error } = await supabase.from("age_verifications").insert({
      user_id: userId,
      verified,
      timestamp: new Date().toISOString(),
      user_agent: navigator.userAgent.split(" ")[0], // Only store browser info, not full UA
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error("Error tracking age verification:", error)
    return { success: false, error }
  }
}
