import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { botProtectionMiddleware } from "@/middleware/bot-protection"

// Update the middleware to handle the age verification cookie and bot protection
export function middleware(request: NextRequest) {
  // First, check for bot protection
  const botProtectionResponse = botProtectionMiddleware(request)
  if (botProtectionResponse.status !== 200) {
    return botProtectionResponse
  }

  // Check if the user is visiting a page that should bypass age verification
  const url = request.nextUrl.clone()
  const bypassPaths = [
    "/age-verification",
    "/user-agreement",
    "/privacy-policy",
    "/signin",
    "/_next", // Allow Next.js resources
    "/api", // Allow API routes
    "/favicon.ico",
  ]

  // Check if the current path should bypass verification
  if (bypassPaths.some((path) => url.pathname.startsWith(path))) {
    return NextResponse.next()
  }

  // Check for age verification in cookies
  const ageVerified = request.cookies.get("ageVerified")?.value === "true"

  // If not verified, redirect to age verification page
  if (!ageVerified) {
    url.pathname = "/age-verification"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// Only run middleware on specific paths
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
