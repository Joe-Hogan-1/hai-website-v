import { type NextRequest, NextResponse } from "next/server"

// Paths that should always be accessible regardless of coming soon mode
const ALLOWED_PATHS = ["/api/", "/signin", "/_next/", "/fonts/", "/favicon.ico", "/robots.txt"]

// Check if path is allowed even in coming soon mode
function isAllowedPath(path: string): boolean {
  return ALLOWED_PATHS.some((allowedPath) => path.startsWith(allowedPath))
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Add the pathname to headers so it can be accessed in the layout
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set("x-pathname", pathname)

  // Allow access to dashboard for authenticated users
  if (pathname.startsWith("/dashboard")) {
    // Let auth middleware handle this
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  // Skip middleware on allowed paths
  if (isAllowedPath(pathname)) {
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    })
  }

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })
}

export const config = {
  matcher: ["/((?!api/|_next/|fonts/|favicon.ico).*)"],
}
