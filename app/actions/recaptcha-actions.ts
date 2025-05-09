"use server"

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  // If it's a development token, always return true
  if (token.startsWith("dev-mode-fake-token-")) {
    console.warn("Using development mode reCAPTCHA verification")
    return true
  }

  if (!token) return false

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY environment variable")
      return false
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    return data.success && data.score >= 0.5 // For v3, check score
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    // In development, allow the form to be submitted even if verification fails
    if (process.env.NODE_ENV === "development") {
      console.warn("Using development mode reCAPTCHA verification after error")
      return true
    }
    return false
  }
}
