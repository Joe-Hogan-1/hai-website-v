// Helper functions for cookie management

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
 * Track a page view in cookies
 */
export function trackPageView(path: string) {
  // Get existing page views
  const pageViewsStr = getCookie("page_views")
  let pageViews: Record<string, number> = {}

  if (pageViewsStr) {
    try {
      pageViews = JSON.parse(pageViewsStr)
    } catch (e) {
      // If parsing fails, start with empty object
      pageViews = {}
    }
  }

  // Increment page view count
  pageViews[path] = (pageViews[path] || 0) + 1

  // Store updated page views (expires in 30 days)
  setCookie("page_views", JSON.stringify(pageViews), 30)

  return pageViews
}

/**
 * Get all stored user data from cookies
 */
export function getAllUserData(): Record<string, any> {
  const userData: Record<string, any> = {
    user_id: getCookie("user_id"),
    cookie_consent: getCookie("cookie_consent"),
    page_views: getCookie("page_views") ? JSON.parse(getCookie("page_views") || "{}") : {},
    first_visit: getCookie("first_visit"),
    last_visit: new Date().toISOString(),
  }

  // Set first visit if not already set
  if (!userData.first_visit) {
    const now = new Date().toISOString()
    setCookie("first_visit", now, 365)
    userData.first_visit = now
  }

  // Update last visit
  setCookie("last_visit", userData.last_visit, 365)

  return userData
}
