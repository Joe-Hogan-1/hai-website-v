"use client"

import type React from "react"
import "./globals.css"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { BreakingNewsProvider } from "@/contexts/breaking-news-context"
import WhiteBackground from "@/components/white-background"
import { FontLoader } from "@/components/font-loader"
import PageTransition from "@/components/page-transition"
import ComingSoonGate from "@/components/coming-soon-gate"
import ScrollRestoration from "@/components/scroll-restoration"

// Import client components normally - they'll be rendered on the client
import ClientComponents from "@/components/client-components"

// Font configuration
const fontNewOrder = {
  variable: "--font-new-order",
  display: "swap",
}

export default function ClientRootLayout({
  children,
  comingSoonStatus,
}: {
  children: React.ReactNode
  comingSoonStatus: { active: boolean; message: string }
}) {
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
            <ConditionalFooter />
            <Toaster position="top-right" />

            {/* Coming Soon Gate */}
            {comingSoonStatus.active && <ComingSoonGate message={comingSoonStatus.message} />}
          </BreakingNewsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}

import { usePathname } from "next/navigation"
function ConditionalFooter() {
  const pathname = usePathname()

  // Don't show footer on age verification page
  if (pathname === "/age-verification") {
    return null
  }

  return <Footer />
}
