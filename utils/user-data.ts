import { supabase } from "@/utils/supabase"
import { getAllUserData, getCookie, setCookie, getSessionId, getDeviceInfo, getUtmParameters } from "@/utils/cookies"

// Disable analytics tracking if there are persistent issues
let ANALYTICS_ENABLED = true

// Enable debug mode for detailed logging
const DEBUG_MODE = false

/**
 * Helper function to safely stringify objects for logging
 */
function safeStringify(obj: any): string {
  try {
    return JSON.stringify(
      obj,
      (key, value) => {
        // Handle circular references and functions
        if (typeof value === "function") return "[Function]"
        if (typeof value === "object" && value !== null) {
          if (Object.keys(value).length === 0) return "[Empty Object]"
        }
        return value
      },
      2,
    )
  } catch (err) {
    return `[Unstringifiable Object: ${err.message}]`
  }
}

/**
 * Helper function to log detailed error information
 */
function logDetailedError(context: string, error: any, additionalInfo: Record<string, any> = {}) {
  console.error(`=== DETAILED ERROR IN ${context.toUpperCase()} ===`)
  console.error(`Timestamp: ${new Date().toISOString()}`)

  // Log error properties
  console.error(`Error type: ${error?.constructor?.name || "Unknown"}`)
  console.error(`Error message: ${error?.message || "No message"}`)
  console.error(`Error name: ${error?.name || "No name"}`)
  console.error(`Error code: ${error?.code || "No code"}`)

  // Log Supabase-specific error details
  if (error?.details) console.error(`Error details: ${safeStringify(error.details)}`)
  if (error?.hint) console.error(`Error hint: ${error.hint}`)
  if (error?.statusCode) console.error(`Status code: ${error.statusCode}`)

  // Log stack trace if available
  if (error?.stack) console.error(`Stack trace: ${error.stack}`)

  // Log additional context information
  console.error(`Additional info: ${safeStringify(additionalInfo)}`)

  // Log the full error object
  try {
    console.error("Full error object:", error)
  } catch (e) {
    console.error("Could not log full error object")
  }

  console.error("=== END DETAILED ERROR ===")
}

/**
 * Store user data in Supabase with enhanced information
 */
export async function storeUserData(additionalData: Record<string, any> = {}) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get all user data from cookies
    const userData = getAllUserData()

    // Ensure we have a user_id
    if (!userData.user_id) {
      const newUserId = `user_${Math.random().toString(36).substring(2, 15)}`
      setCookie("user_id", newUserId, 365)
      userData.user_id = newUserId
    }

    // Get session ID
    const sessionId = getSessionId()

    // Get device information
    const deviceInfo = getDeviceInfo()

    // Get UTM parameters
    const utmParams = getUtmParameters()

    // Merge with additional data
    const dataToStore = {
      ...userData,
      ...additionalData,
      session_id: sessionId,
      device_info: deviceInfo,
      utm_params: utmParams,
      updated_at: new Date().toISOString(),
    }

    // Use a service role key or enable anonymous inserts for this table
    const { error } = await supabase.from("user_data").upsert(
      {
        user_id: dataToStore.user_id,
        data: {
          consent_given: dataToStore.cookie_consent === "true",
          consent_timestamp: dataToStore.updated_at,
          device_info: deviceInfo,
          utm_params: utmParams,
          referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
          landing_page:
            typeof sessionStorage !== "undefined"
              ? sessionStorage.getItem("landing_page") ||
                (typeof window !== "undefined" ? window.location.pathname : "/")
              : "/",
          visit_count: userData.visit_count,
          first_seen_at: userData.first_visit,
          last_seen_at: userData.last_visit,
        },
        first_seen_at: userData.first_visit,
        last_seen_at: userData.last_visit,
        visit_count: userData.visit_count,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "user_id",
      },
    )

    if (error) {
      console.error("Supabase error storing user data:", error)

      // Store locally as fallback
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(
            "user_data_local",
            JSON.stringify({
              user_id: dataToStore.user_id,
              timestamp: new Date().toISOString(),
              data: dataToStore,
            }),
          )
        } catch (e) {
          // Ignore localStorage errors
        }
      }

      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing user data:", error)

    // Disable analytics if we encounter persistent errors
    if (typeof localStorage !== "undefined") {
      const errorCount = Number.parseInt(localStorage.getItem("analytics_error_count") || "0") + 1
      localStorage.setItem("analytics_error_count", errorCount.toString())

      if (errorCount > 5) {
        console.warn("Disabling analytics due to persistent errors")
        ANALYTICS_ENABLED = false
        localStorage.setItem("analytics_disabled", "true")
      }
    }

    return { success: false, error }
  }
}

/**
 * Track a page view and store in Supabase with enhanced data
 */
export async function trackPageViewInSupabase(path: string) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Get device information
    const deviceInfo = getDeviceInfo()

    // Get UTM parameters
    const utmParams = getUtmParameters()

    // Calculate time on page if available
    let timeOnPage = null
    if (typeof sessionStorage !== "undefined") {
      const pageEntryTime = sessionStorage.getItem("page_entry_time")
      if (pageEntryTime) {
        timeOnPage = Date.now() - Number.parseInt(pageEntryTime)
      }
    }

    // Get scroll depth if available
    let scrollDepth = null
    if (typeof sessionStorage !== "undefined") {
      const storedScrollDepth = sessionStorage.getItem(`scroll_depth_${path}`)
      if (storedScrollDepth) {
        scrollDepth = Number.parseInt(storedScrollDepth)
      }
    }

    // Simplify the device info to avoid serialization issues
    const simpleDeviceInfo = {
      type: deviceInfo?.deviceType || "unknown",
      browser: deviceInfo?.browser || "unknown",
      os: deviceInfo?.os || "unknown",
      screen: deviceInfo?.screenWidth ? `${deviceInfo.screenWidth}x${deviceInfo.screenHeight}` : "unknown",
    }

    // Insert the page view with enhanced data
    const { error } = await supabase.from("page_views").insert({
      user_id: userId,
      session_id: sessionId,
      path,
      timestamp: new Date().toISOString(),
      referrer: typeof document !== "undefined" ? document.referrer || "direct" : "direct",
      time_on_page: timeOnPage,
      scroll_depth: scrollDepth,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content,
      device_info: simpleDeviceInfo,
    })

    if (error) {
      console.error("Supabase error tracking page view:", error)

      // Store locally as fallback
      if (typeof localStorage !== "undefined") {
        try {
          const existingViews = JSON.parse(localStorage.getItem("page_views_local") || "[]")
          existingViews.push({
            path,
            timestamp: new Date().toISOString(),
            user_id: userId,
          })

          // Keep only last 20 views to avoid storage issues
          if (existingViews.length > 20) {
            existingViews.splice(0, existingViews.length - 20)
          }

          localStorage.setItem("page_views_local", JSON.stringify(existingViews))
        } catch (e) {
          // Ignore localStorage errors
        }
      }

      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking page view:", error)

    // Disable analytics if we encounter persistent errors
    if (typeof localStorage !== "undefined") {
      const errorCount = Number.parseInt(localStorage.getItem("analytics_error_count") || "0") + 1
      localStorage.setItem("analytics_error_count", errorCount.toString())

      if (errorCount > 5) {
        console.warn("Disabling analytics due to persistent errors")
        ANALYTICS_ENABLED = false
        localStorage.setItem("analytics_disabled", "true")
      }
    }

    return { success: false, error }
  }
}

/**
 * Track an age verification event with enhanced data
 */
export async function trackAgeVerification(verified: boolean) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Get device information
    const deviceInfo = getDeviceInfo()

    // Insert the age verification with enhanced data
    const { error } = await supabase.from("age_verifications").insert({
      user_id: userId,
      session_id: sessionId,
      verified,
      timestamp: new Date().toISOString(),
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
      device_info: deviceInfo,
    })

    if (error) {
      console.error("Supabase error tracking age verification:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking age verification:", error)
    return { success: false, error }
  }
}

/**
 * Track user interaction with elements
 */
export async function trackUserInteraction(
  interactionType: string,
  elementId: string,
  elementType: string,
  interactionData: Record<string, any> = {},
) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Insert the interaction
    const { error } = await supabase.from("user_interactions").insert({
      user_id: userId,
      session_id: sessionId,
      page_path: typeof window !== "undefined" ? window.location.pathname : "/",
      interaction_type: interactionType,
      element_id: elementId,
      element_type: elementType,
      interaction_data: interactionData,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Supabase error tracking user interaction:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking user interaction:", error)
    return { success: false, error }
  }
}

/**
 * Track product interaction
 */
export async function trackProductInteractionInSupabase(
  productId: string,
  interactionType: string,
  interactionData: Record<string, any> = {},
) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Insert the product interaction
    const { error } = await supabase.from("product_interactions").insert({
      user_id: userId,
      session_id: sessionId,
      product_id: productId,
      interaction_type: interactionType,
      interaction_data: interactionData,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Supabase error tracking product interaction:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking product interaction:", error)
    return { success: false, error }
  }
}

/**
 * Track content engagement
 */
export async function trackContentEngagement(
  contentId: string,
  contentType: string,
  engagementType: string,
  engagementTime: number,
  engagementData: Record<string, any> = {},
) {
  // Skip if analytics is disabled
  if (!ANALYTICS_ENABLED) return { success: false, error: "Analytics disabled" }

  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Insert the content engagement
    const { error } = await supabase.from("content_engagement").insert({
      user_id: userId,
      session_id: sessionId,
      content_id: contentId,
      content_type: contentType,
      engagement_type: engagementType,
      engagement_time: engagementTime,
      engagement_data: engagementData,
      timestamp: new Date().toISOString(),
    })

    if (error) {
      console.error("Supabase error tracking content engagement:", error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error("Error tracking content engagement:", error)
    return { success: false, error }
  }
}

// Check if analytics should be disabled based on previous errors
if (typeof localStorage !== "undefined" && localStorage.getItem("analytics_disabled") === "true") {
  ANALYTICS_ENABLED = false
  console.warn("Analytics tracking is disabled due to previous errors")
}

// Reset error count periodically
if (typeof localStorage !== "undefined" && typeof window !== "undefined") {
  // Reset error count every 24 hours
  const lastReset = localStorage.getItem("analytics_error_reset")
  const now = new Date().toISOString()

  if (!lastReset || new Date(lastReset).getTime() < Date.now() - 86400000) {
    localStorage.setItem("analytics_error_count", "0")
    localStorage.setItem("analytics_error_reset", now)

    // Re-enable analytics if it was disabled
    if (localStorage.getItem("analytics_disabled") === "true") {
      localStorage.removeItem("analytics_disabled")
      ANALYTICS_ENABLED = true
      console.log("Re-enabling analytics tracking")
    }
  }
}

// Create a function to sync local fallback data with the database
export async function syncFallbackData() {
  if (typeof localStorage === "undefined") return { success: false, reason: "localStorage not available" }

  try {
    // Sync user data
    const fallbackUserData = localStorage.getItem("user_data_fallback")
    if (fallbackUserData) {
      try {
        const parsedData = JSON.parse(fallbackUserData)
        await storeUserData(parsedData.additionalData)
        localStorage.removeItem("user_data_fallback")
      } catch (error) {
        console.error("Error syncing fallback user data:", error)
      }
    }

    // Sync page views
    const fallbackPageViews = localStorage.getItem("page_views_fallback")
    if (fallbackPageViews) {
      try {
        const pageViews = JSON.parse(fallbackPageViews)
        for (const pageView of pageViews) {
          await trackPageViewInSupabase(pageView.path)
        }
        localStorage.removeItem("page_views_fallback")
      } catch (error) {
        console.error("Error syncing fallback page views:", error)
      }
    }

    return { success: true }
  } catch (error) {
    console.error("Error syncing fallback data:", error)
    return { success: false, error }
  }
}

// REMOVED: createAnalyticsTables, executeSql, and createMinimalAnalyticsTables functions
// These were causing the TypeError: supabase.rpc(...).catch is not a function error
