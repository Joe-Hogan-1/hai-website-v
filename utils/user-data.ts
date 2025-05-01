import { supabase } from "@/utils/supabase"
import { getAllUserData, getCookie, setCookie, getSessionId, getDeviceInfo, getUtmParameters } from "@/utils/cookies"

/**
 * Store user data in Supabase with enhanced information
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
    const { error } = await supabase.from("user_data").upsert({
      user_id: dataToStore.user_id,
      data: {
        consent_given: dataToStore.cookie_consent === "true",
        consent_timestamp: dataToStore.updated_at,
        device_info: deviceInfo,
        utm_params: utmParams,
        referrer: document.referrer || "direct",
        landing_page: sessionStorage.getItem("landing_page") || window.location.pathname,
        visit_count: userData.visit_count,
        first_seen_at: userData.first_visit,
        last_seen_at: userData.last_visit,
      },
      first_seen_at: userData.first_visit,
      last_seen_at: userData.last_visit,
      visit_count: userData.visit_count,
      updated_at: new Date().toISOString(),
    })

    if (error) {
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing user data:", error)
    return { success: false, error }
  }
}

/**
 * Track a page view and store in Supabase with enhanced data
 */
export async function trackPageViewInSupabase(path: string) {
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
    const pageEntryTime = sessionStorage.getItem("page_entry_time")
    if (pageEntryTime) {
      timeOnPage = Date.now() - Number.parseInt(pageEntryTime)
    }

    // Get scroll depth if available
    let scrollDepth = null
    const storedScrollDepth = sessionStorage.getItem(`scroll_depth_${path}`)
    if (storedScrollDepth) {
      scrollDepth = Number.parseInt(storedScrollDepth)
    }

    // Insert the page view with enhanced data
    const { error } = await supabase.from("page_views").insert({
      user_id: userId,
      session_id: sessionId,
      path,
      timestamp: new Date().toISOString(),
      referrer: document.referrer || "direct",
      time_on_page: timeOnPage,
      scroll_depth: scrollDepth,
      utm_source: utmParams.utm_source,
      utm_medium: utmParams.utm_medium,
      utm_campaign: utmParams.utm_campaign,
      utm_term: utmParams.utm_term,
      utm_content: utmParams.utm_content,
      device_info: deviceInfo,
      geo_info: {}, // This would need to be populated server-side
      referrer_info: {
        full_referrer: document.referrer,
        referrer_domain: document.referrer ? new URL(document.referrer).hostname : null,
      },
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}

/**
 * Track an age verification event with enhanced data
 */
export async function trackAgeVerification(verified: boolean) {
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
      user_agent: navigator.userAgent,
      device_info: deviceInfo,
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
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
  try {
    // Get user_id from cookie
    const userId = getCookie("user_id")

    // Get session ID
    const sessionId = getSessionId()

    // Insert the interaction
    const { error } = await supabase.from("user_interactions").insert({
      user_id: userId,
      session_id: sessionId,
      page_path: window.location.pathname,
      interaction_type: interactionType,
      element_id: elementId,
      element_type: elementType,
      interaction_data: interactionData,
      timestamp: new Date().toISOString(),
    })

    if (error) throw error
    return { success: true }
  } catch (error) {
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

    if (error) throw error
    return { success: true }
  } catch (error) {
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

    if (error) throw error
    return { success: true }
  } catch (error) {
    return { success: false, error }
  }
}
