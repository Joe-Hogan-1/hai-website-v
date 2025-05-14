import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { botProtectionMiddleware } from "@/middleware/bot-protection"

export function middleware(request: NextRequest) {
  // First, check for bot protection
  const botProtectionResponse = botProtectionMiddleware(request)
  if (botProtectionResponse.status !== 200) {
    return botProtectionResponse
  }

  // Check if the user is visiting a page that should bypass age verification
  const url = request.nextUrl.clone()
  const path = url.pathname

  // Define paths that should bypass age verification
  const bypassPaths = [
    "/age-verification",
    "/user-agreement",
    "/privacy-policy",
    "/signin",
    "/_next",
    "/api",
    "/favicon.ico",
  ]

  // Check if the current path should bypass verification
  // Also bypass all dashboard routes completely to avoid auth conflicts
  if (bypassPaths.some((bypass) => path.startsWith(bypass)) || path.startsWith("/dashboard")) {
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
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
}
