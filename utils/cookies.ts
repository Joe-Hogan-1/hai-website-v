// Enhanced cookie management utility

/**
 * Set a cookie with the given name, value and expiration days
 */
export function setCookie(name: string, value: string, days: number) {
  let expires = ""
  if (days) {
    const date = new Date()
    date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000)
    expires = "; expires=" + date.toUTCString()
  }
  document.cookie = name + "=" + (value || "") + expires + "; path=/; SameSite=Lax"
}

/**
 * Get a cookie value by name
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "="
  const ca = document.cookie.split(";")
  for (let i = 0; i < ca.length; i++) {
    let c = ca[i]
    while (c.charAt(0) === " ") c = c.substring(1, c.length)
    if (c.indexOf(nameEQ) === 0) return c.substring(nameEQ.length, c.length)
  }
  return null
}

/**
 * Delete a cookie by name
 */
export function eraseCookie(name: string) {
  document.cookie = name + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;"
}

/**
 * Check if a specific cookie type is allowed based on user preferences
 */
export function isCookieTypeAllowed(type: "essential" | "analytics" | "functional" | "targeting"): boolean {
  // Essential cookies are always allowed
  if (type === "essential") return true

  // Check if user has given general consent
  const consentCookie = getCookie("cookie_consent")

  // If no consent or explicit rejection, only allow essential cookies
  if (!consentCookie || consentCookie === "false") {
    return false
  }

  // If consent is "essential", only allow essential cookies
  if (consentCookie === "essential") {
    return false
  }

  // Check for specific preferences
  const preferencesCookie = getCookie("cookie_preferences")
  if (preferencesCookie) {
    try {
      const preferences = JSON.parse(preferencesCookie)
      return !!preferences[type]
    } catch (e) {
      // If there's an error parsing preferences, fall back to consent cookie
      return consentCookie === "true"
    }
  }

  // If no specific preferences but general consent is given, allow all except targeting by default
  return type !== "targeting" || consentCookie === "true"
}

/**
 * Generate a unique session ID
 */
export function generateSessionId(): string {
  return (
    "session_" +
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15) +
    "_" +
    Date.now()
  )
}

/**
 * Get or create a session ID
 */
export function getSessionId(): string {
  let sessionId = sessionStorage.getItem("session_id")

  if (!sessionId) {
    sessionId = generateSessionId()
    sessionStorage.setItem("session_id", sessionId)
  }

  return sessionId
}

/**
 * Track a page view in cookies with enhanced data
 */
export function trackPageView(path: string) {
  // Get existing page views
  const pageViewsStr = getCookie("page_views")
  let pageViews: Record<string, any> = {}

  if (pageViewsStr) {
    try {
      pageViews = JSON.parse(pageViewsStr)
    } catch (e) {
      // If parsing fails, start with empty object
      pageViews = {}
    }
  }

  // Get entry time for this page
  const entryTime = Date.now()

  // Store entry time in sessionStorage to calculate time on page later
  if (typeof sessionStorage !== "undefined") {
    // Save previous page's exit time if there was a previous page
    const prevPath = sessionStorage.getItem("current_path")
    const prevEntryTime = sessionStorage.getItem("page_entry_time")

    if (prevPath && prevPath !== path && prevEntryTime) {
      const timeOnPrevPage = entryTime - Number.parseInt(prevEntryTime)

      // Update time spent on previous page
      if (pageViews[prevPath]) {
        pageViews[prevPath].timeSpent = (pageViews[prevPath].timeSpent || 0) + timeOnPrevPage
        pageViews[prevPath].exitCount = (pageViews[prevPath].exitCount || 0) + 1
      }
    }

    // Set current page info
    sessionStorage.setItem("current_path", path)
    sessionStorage.setItem("page_entry_time", entryTime.toString())
  }

  // Increment page view count or initialize
  if (!pageViews[path]) {
    pageViews[path] = {
      count: 1,
      firstVisit: new Date().toISOString(),
      timeSpent: 0,
      exitCount: 0,
    }
  } else {
    pageViews[path].count = (pageViews[path].count || 0) + 1
    pageViews[path].lastVisit = new Date().toISOString()
  }

  // Store updated page views (expires in 30 days)
  setCookie("page_views", JSON.stringify(pageViews), 30)

  return pageViews
}

/**
 * Track scroll depth for the current page
 */
export function trackScrollDepth() {
  if (typeof window === "undefined") return

  let maxScrollDepth = 0
  const path = window.location.pathname

  const calculateScrollDepth = () => {
    const scrollTop = window.scrollY || document.documentElement.scrollTop
    const windowHeight = window.innerHeight
    const documentHeight = Math.max(
      document.body.scrollHeight,
      document.body.offsetHeight,
      document.documentElement.clientHeight,
      document.documentElement.scrollHeight,
      document.documentElement.offsetHeight,
    )

    if (documentHeight <= windowHeight) return 100

    const scrollPercent = Math.floor((scrollTop / (documentHeight - windowHeight)) * 100)
    maxScrollDepth = Math.max(maxScrollDepth, scrollPercent)

    // Store in sessionStorage
    sessionStorage.setItem(`scroll_depth_${path}`, maxScrollDepth.toString())

    return maxScrollDepth
  }

  // Set up event listeners
  window.addEventListener("scroll", calculateScrollDepth)
  window.addEventListener("resize", calculateScrollDepth)

  // Initial calculation
  calculateScrollDepth()

  // Return cleanup function
  return () => {
    window.removeEventListener("scroll", calculateScrollDepth)
    window.removeEventListener("resize", calculateScrollDepth)
  }
}

/**
 * Get UTM parameters from URL
 */
export function getUtmParameters(): Record<string, string> {
  if (typeof window === "undefined") return {}

  const urlParams = new URLSearchParams(window.location.search)
  const utmParams: Record<string, string> = {}
  ;["source", "medium", "campaign", "term", "content"].forEach((param) => {
    const value = urlParams.get(`utm_${param}`)
    if (value) {
      utmParams[`utm_${param}`] = value
    }
  })

  return utmParams
}

/**
 * Get device information
 */
export function getDeviceInfo(): Record<string, any> {
  if (typeof window === "undefined") return {}

  const deviceInfo: Record<string, any> = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    screenWidth: window.screen.width,
    screenHeight: window.screen.height,
    viewportWidth: window.innerWidth,
    viewportHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
    platform: navigator.platform,
    deviceMemory: (navigator as any).deviceMemory,
    hardwareConcurrency: navigator.hardwareConcurrency,
    cookiesEnabled: navigator.cookieEnabled,
    doNotTrack: navigator.doNotTrack,
    timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    connectionType: (navigator as any).connection ? (navigator as any).connection.effectiveType : undefined,
  }

  // Detect device type
  const userAgent = navigator.userAgent.toLowerCase()
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(userAgent)) {
    deviceInfo.deviceType = "tablet"
  } else if (/mobile|android|iphone|ipod|blackberry|opera mini|iemobile/i.test(userAgent)) {
    deviceInfo.deviceType = "mobile"
  } else {
    deviceInfo.deviceType = "desktop"
  }

  // Detect browser
  if (userAgent.indexOf("firefox") > -1) {
    deviceInfo.browser = "firefox"
  } else if (userAgent.indexOf("edg") > -1) {
    deviceInfo.browser = "edge"
  } else if (userAgent.indexOf("chrome") > -1) {
    deviceInfo.browser = "chrome"
  } else if (userAgent.indexOf("safari") > -1) {
    deviceInfo.browser = "safari"
  } else if (userAgent.indexOf("opera") > -1 || userAgent.indexOf("opr") > -1) {
    deviceInfo.browser = "opera"
  } else if (userAgent.indexOf("msie") > -1 || userAgent.indexOf("trident") > -1) {
    deviceInfo.browser = "ie"
  } else {
    deviceInfo.browser = "unknown"
  }

  return deviceInfo
}

/**
 * Get all stored user data from cookies with enhanced information
 */
export function getAllUserData(): Record<string, any> {
  const userData: Record<string, any> = {
    user_id: getCookie("user_id"),
    cookie_consent: getCookie("cookie_consent"),
    page_views: getCookie("page_views") ? JSON.parse(getCookie("page_views") || "{}") : {},
    first_visit: getCookie("first_visit"),
    last_visit: new Date().toISOString(),
    session_id: getSessionId(),
    device_info: getDeviceInfo(),
    utm_params: getUtmParameters(),
    referrer: document.referrer || "direct",
    landing_page: sessionStorage.getItem("landing_page") || window.location.pathname,
    current_page: window.location.pathname,
    visit_count: Number.parseInt(getCookie("visit_count") || "0") + 1,
  }

  // Set first visit if not already set
  if (!userData.first_visit) {
    const now = new Date().toISOString()
    setCookie("first_visit", now, 365)
    userData.first_visit = now

    // Store landing page for first-time visitors
    if (typeof sessionStorage !== "undefined" && !sessionStorage.getItem("landing_page")) {
      sessionStorage.setItem("landing_page", window.location.pathname)
    }
  }

  // Update last visit
  setCookie("last_visit", userData.last_visit, 365)

  // Update visit count
  setCookie("visit_count", userData.visit_count.toString(), 365)

  return userData
}

/**
 * Track user interaction with a specific element
 */
export function trackInteraction(
  elementId: string,
  interactionType: string,
  elementType: string,
  additionalData: Record<string, any> = {},
) {
  const interaction = {
    timestamp: new Date().toISOString(),
    page: window.location.pathname,
    elementId,
    interactionType,
    elementType,
    ...additionalData,
  }

  // Get existing interactions
  const interactionsStr = localStorage.getItem("user_interactions")
  let interactions = []

  if (interactionsStr) {
    try {
      interactions = JSON.parse(interactionsStr)
    } catch (e) {
      interactions = []
    }
  }

  // Add new interaction
  interactions.push(interaction)

  // Limit to last 100 interactions to prevent localStorage from getting too large
  if (interactions.length > 100) {
    interactions = interactions.slice(-100)
  }

  // Save to localStorage
  localStorage.setItem("user_interactions", JSON.stringify(interactions))

  return interaction
}

/**
 * Track product interaction
 */
export function trackProductInteraction(
  productId: string,
  interactionType: string,
  additionalData: Record<string, any> = {},
) {
  const interaction = {
    timestamp: new Date().toISOString(),
    productId,
    interactionType,
    ...additionalData,
  }

  // Get existing product interactions
  const interactionsStr = localStorage.getItem("product_interactions")
  let interactions = []

  if (interactionsStr) {
    try {
      interactions = JSON.parse(interactionsStr)
    } catch (e) {
      interactions = []
    }
  }

  // Add new interaction
  interactions.push(interaction)

  // Limit to last 50 interactions
  if (interactions.length > 50) {
    interactions = interactions.slice(-50)
  }

  // Save to localStorage
  localStorage.setItem("product_interactions", JSON.stringify(interactions))

  return interaction
}

/**
 * Set age verification status
 */
export function setAgeVerified(): boolean {
  try {
    // Set in sessionStorage for current session
    sessionStorage.setItem("ageVerified", "true")

    // Set in a cookie for server-side verification (middleware)
    document.cookie = "ageVerified=true; path=/; max-age=86400; SameSite=Lax" // 24 hour expiry

    return true
  } catch (error) {
    return false
  }
}

/**
 * Check if age is verified
 */
export function isAgeVerified(): boolean {
  try {
    // Check sessionStorage first (client-side)
    const sessionVerified = sessionStorage.getItem("ageVerified") === "true"

    // Check cookies (works for both client and server)
    const cookieVerified = document.cookie.split("; ").some((cookie) => cookie.startsWith("ageVerified=true"))

    return sessionVerified || cookieVerified
  } catch (error) {
    return false
  }
}

/**
 * Clear age verification
 */
export function clearAgeVerification(): void {
  try {
    sessionStorage.removeItem("ageVerified")
    document.cookie = "ageVerified=; path=/; max-age=0"
  } catch (error) {
    // Silent error handling
  }
}
