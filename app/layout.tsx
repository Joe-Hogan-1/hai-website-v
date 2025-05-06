import { FontLoader } from "@/components/font-loader";
import Footer from "@/components/footer";
import PageTransition from "@/components/page-transition";
import ScrollToTop from "@/components/scroll-to-top";
import WhiteBackground from "@/components/white-background";
import { AuthProvider } from "@/contexts/auth-context";
import { BreakingNewsProvider } from "@/contexts/breaking-news-context";
import { Analytics } from "@vercel/analytics/react";
import type { Metadata } from "next";
import type React from "react";
import { Toaster } from "sonner";
import "./globals.css";

// Import client components normally - they'll be rendered on the client
import ClientComponents from "@/components/client-components";

export const metadata: Metadata = {
  title: "hai. | embrace the glow",
  description: "discover the balance of health, wellness, and recreation",
  generator: "v0.dev",
};

// Font configuration
const fontNewOrder = {
  variable: "--font-new-order",
  display: "swap",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen flex flex-col">
        <Analytics />
        <FontLoader />
        <WhiteBackground />
        <AuthProvider>
          <BreakingNewsProvider>
            <ScrollToTop />
            {/* ScrollOptimizer removed to fix initialization error */}
            <ClientComponents />
            <main className="flex-grow">
              <PageTransition>{children}</PageTransition>
            </main>
            <Footer />
            <Toaster position="top-right" />
          </BreakingNewsProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
