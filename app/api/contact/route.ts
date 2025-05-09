import { type NextRequest, NextResponse } from "next/server"
import { verifyRecaptchaToken } from "@/components/contact/recaptcha"

// Rate limiting
const RATE_LIMIT_WINDOW = 60 * 60 * 1000 // 1 hour
const MAX_SUBMISSIONS_PER_HOUR = 5

// In-memory store for rate limiting (would use Redis in production)
const ipSubmissions = new Map<string, { count: number; timestamp: number }>()

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now()
  for (const [ip, data] of ipSubmissions.entries()) {
    if (now - data.timestamp > RATE_LIMIT_WINDOW) {
      ipSubmissions.delete(ip)
    }
  }
}, RATE_LIMIT_WINDOW)

export async function POST(request: NextRequest) {
  try {
    const ip = request.ip || "unknown"

    // Rate limiting
    const now = Date.now()
    const ipData = ipSubmissions.get(ip) || { count: 0, timestamp: now }

    // Reset count if outside the window
    if (now - ipData.timestamp > RATE_LIMIT_WINDOW) {
      ipData.count = 1
      ipData.timestamp = now
    } else {
      ipData.count++
    }

    ipSubmissions.set(ip, ipData)

    // Block if rate limit exceeded
    if (ipData.count > MAX_SUBMISSIONS_PER_HOUR) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 })
    }

    const formData = await request.formData()

    // Check honeypot fields
    const botCheckName = formData.get("bot_check_name") as string
    const botCheckEmail = formData.get("bot_check_email") as string

    if (botCheckName || botCheckEmail) {
      // Silently reject bot submissions with a fake success
      return NextResponse.json({ success: true })
    }

    // Check submission timing
    const submissionTime = Number.parseInt((formData.get("form_submission_time") as string) || "0")
    const timeDiff = now - submissionTime

    if (submissionTime > 0 && timeDiff < 3000) {
      // Too fast, likely a bot - silently reject with fake success
      return NextResponse.json({ success: true })
    }

    // Verify reCAPTCHA
    const recaptchaToken = formData.get("g-recaptcha-response") as string
    const isValidRecaptcha = await verifyRecaptchaToken(recaptchaToken)

    if (!isValidRecaptcha) {
      return NextResponse.json({ error: "reCAPTCHA verification failed. Please try again." }, { status: 400 })
    }

    // Forward to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT
    if (!formspreeEndpoint) {
      return NextResponse.json({ error: "Form submission service not configured." }, { status: 500 })
    }

    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    const responseData = await response.json()

    if (!response.ok) {
      return NextResponse.json({ error: responseData.error || "Form submission failed." }, { status: response.status })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Form submission error:", error)
    return NextResponse.json({ error: "An unexpected error occurred." }, { status: 500 })
  }
}
