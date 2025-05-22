import type React from "react"
import type { Metadata } from "next"
import { headers } from "next/headers"
import "./globals.css"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { BreakingNewsProvider } from "@/contexts/breaking-news-context"
import WhiteBackground from "@/components/white-background"
import { FontLoader } from "@/components/font-loader"
import PageTransition from "@/components/page-transition"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"
import ComingSoonGate from "@/components/coming-soon-gate"
import ScrollRestoration from "@/components/scroll-restoration"

// Import client components normally - they'll be rendered on the client
import ClientComponents from "@/components/client-components"

export const metadata: Metadata = {
  title: "hai. | embrace the glow",
  description: "discover the balance of health, wellness, and recreation",
    generator: 'v0.dev'
}

// Font configuration
const fontNewOrder = {
  variable: "--font-new-order",
  display: "swap",
}

async function getComingSoonStatus(pathname: string) {
  // Don't show coming soon on these paths
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/signin") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/fonts/")
  ) {
    return { active: false, message: "" }
  }

  try {
    const cookieStore = cookies()
    const supabase = createServerComponentClient({ cookies: () => cookieStore })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (session) {
      // Authenticated users bypass coming soon mode
      return { active: false, message: "" }
    }

    // Get coming soon status directly from the database
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", "coming_soon_mode")
      .order("id", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      console.error("Error getting coming soon status:", error)
      return { active: false, message: "" }
    }

    console.log("Coming soon data from database:", data)

    // Ensure we're checking the active property correctly
    if (!data.value || data.value.active === undefined) {
      return { active: false, message: "" }
    }

    return {
      active: Boolean(data.value.active),
      message: data.value.message || "",
    }
  } catch (err) {
    console.error("Unexpected error getting coming soon status:", err)
    return { active: false, message: "" }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Get the current path from the request
  const pathname = headers().get("x-pathname") || ""

  // Get coming soon status
  const comingSoonStatus = await getComingSoonStatus(pathname)

  // Log the status for debugging
  console.log("Coming soon status:", comingSoonStatus)

  return (
    <html lang="en">
      <head>
        <style>{`
          .no-tap-highlight {
            -webkit-tap-highlight-color: transparent;
          }
          a {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            outline: none;
          }
          button {
            -webkit-tap-highlight-color: transparent;
            -webkit-touch-callout: none;
            outline: none;
          }
        `}</style>
      </head>
      <body className="min-h-screen flex flex-col" style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
        <FontLoader />
        <WhiteBackground />
        <ScrollRestoration />
        <AuthProvider>
          <BreakingNewsProvider>
            <ScrollToTop />
            {/* ScrollOptimizer removed to fix initialization error */}
            <ClientComponents />
            <main className="flex-grow" style={{ marginTop: 0, paddingTop: 0 }}>
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <Toaster position="top-right" />

            {/* Coming Soon Gate */}
            {comingSoonStatus.active && <ComingSoonGate message={comingSoonStatus.message} />}
          </BreakingNewsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
