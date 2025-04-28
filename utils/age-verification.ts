/**
 * Helper functions for age verification
 */

// Store age verification in sessionStorage and cookies
export function setAgeVerified() {
  try {
    // Set in sessionStorage for current session
    sessionStorage.setItem("ageVerified", "true")

    // Set in a cookie for server-side verification (middleware)
    document.cookie = "ageVerified=true; path=/; max-age=86400; SameSite=Lax" // 24 hour expiry

    return true
  } catch (error) {
    console.error("Error setting age verification:", error)
    return false
  }
}

// Check if user is age verified
export function isAgeVerified(): boolean {
  try {
    // Check sessionStorage first (client-side)
    const sessionVerified = sessionStorage.getItem("ageVerified") === "true"

    // Check cookies (works for both client and server)
    const cookieVerified = document.cookie.split("; ").some((cookie) => cookie.startsWith("ageVerified=true"))

    return sessionVerified || cookieVerified
  } catch (error) {
    console.error("Error checking age verification:", error)
    return false
  }
}

// Clear age verification
export function clearAgeVerification() {
  try {
    sessionStorage.removeItem("ageVerified")
    document.cookie = "ageVerified=; path=/; max-age=0"
  } catch (error) {
    console.error("Error clearing age verification:", error)
  }
}
