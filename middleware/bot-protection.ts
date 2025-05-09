import { type NextRequest, NextResponse } from "next/server"

// Common bot user agents
const BOT_USER_AGENTS = [
  "bot",
  "crawl",
  "spider",
  "scrape",
  "wget",
  "curl",
  "phantom",
  "headless",
  "selenium",
  "puppeteer",
]

// IP-based rate limiting
const RATE_LIMIT_DURATION = 60 * 1000 // 1 minute
const MAX_REQUESTS_PER_MINUTE = 60

// In-memory store for rate limiting (would use Redis in production)
const ipRequests = new Map<string, { count: number; timestamp: number }>()

// Clean up old entries every 5 minutes
setInterval(
  () => {
    const now = Date.now()
    for (const [ip, data] of ipRequests.entries()) {
      if (now - data.timestamp > RATE_LIMIT_DURATION) {
        ipRequests.delete(ip)
      }
    }
  },
  5 * 60 * 1000,
)

export function botProtectionMiddleware(req: NextRequest) {
  const userAgent = req.headers.get("user-agent") || ""
  const ip = req.ip || "unknown"

  // Check for suspicious user agents
  const isSuspiciousUserAgent = BOT_USER_AGENTS.some((botAgent) => userAgent.toLowerCase().includes(botAgent))

  // Check for missing headers that browsers typically send
  const hasAcceptHeader = req.headers.get("accept") !== null
  const hasAcceptLanguage = req.headers.get("accept-language") !== null

  // Rate limiting
  const now = Date.now()
  const ipData = ipRequests.get(ip) || { count: 0, timestamp: now }

  // Reset count if outside the window
  if (now - ipData.timestamp > RATE_LIMIT_DURATION) {
    ipData.count = 1
    ipData.timestamp = now
  } else {
    ipData.count++
  }

  ipRequests.set(ip, ipData)

  // Block if rate limit exceeded
  if (ipData.count > MAX_REQUESTS_PER_MINUTE) {
    return new NextResponse(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Block suspicious requests
  if (isSuspiciousUserAgent && (!hasAcceptHeader || !hasAcceptLanguage)) {
    return new NextResponse(JSON.stringify({ error: "Access denied" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    })
  }

  // Add security headers
  const response = NextResponse.next()
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")

  return response
}
