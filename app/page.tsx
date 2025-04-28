"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import ScrollingMediaBanner from "@/components/scrolling-media-banner"

// Add imports for our components
import ScrollAnimatedText from "@/components/scroll-animated-text"
import ScrollAnimatedElement from "@/components/scroll-animated-element"

export default function HomePage() {
  const router = useRouter()
  const [isVerified, setIsVerified] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [showContent, setShowContent] = useState(false)

  useEffect(() => {
    // Check if user has already been verified in this session
    const verified = sessionStorage.getItem("ageVerified") === "true"
    if (!verified) {
      router.push("/age-verification")
      return
    }

    setIsVerified(true)
    setShowContent(true)
    setIsLoading(false)
  }, [router])

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-3xl text-[#ffd6c0]">hai.</div>
      </div>
    )
  }

  return (
    <>
      <WaterBackground />
      <Header />
      <div className="relative overflow-hidden">
        <div className="relative z-10">
          {/* Welcome Section */}
          <section className="min-h-screen flex flex-col items-center justify-start pt-24 relative welcome-section">
            <div className="max-w-4xl mx-auto text-center p-6 mb-8 mt-4">
              <ScrollAnimatedText
                text="welcome to hai."
                tag="h1"
                className="text-6xl font-semibold mb-6 text-white drop-shadow-xl tracking-wide"
                threshold={0.5}
                delay={200}
              />
              <ScrollAnimatedElement delay={400} threshold={0.5}>
                <p className="text-2xl mb-4 text-black font-medium">
                  discover our premium products and stay updated with our latest news.
                </p>
              </ScrollAnimatedElement>
            </div>
            {/* Scrolling Media Banner - Larger size */}
            <div className="w-full max-w-6xl mx-auto h-[80vh] px-4">
              <ScrollingMediaBanner position={0} />
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
