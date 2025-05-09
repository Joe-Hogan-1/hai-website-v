"\"use server"

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
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
    return false
  }
}
\
"
