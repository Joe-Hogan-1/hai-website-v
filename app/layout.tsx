import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import Footer from "@/components/footer"
import ScrollToTop from "@/components/scroll-to-top"
import { AuthProvider } from "@/contexts/auth-context"
import { Toaster } from "sonner"
import { BreakingNewsProvider } from "@/contexts/breaking-news-context"
import WhiteBackground from "@/components/white-background"
import { FontLoader } from "@/components/font-loader"
import PageTransition from "@/components/page-transition"

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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col" style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
        <FontLoader />
        <WhiteBackground />
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
          </BreakingNewsProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
