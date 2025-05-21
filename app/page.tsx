"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Header from "@/components/header"
import HomeMediaCarousel from "@/components/home-media-carousel"
import NewsletterPopup from "@/components/newsletter-popup"
import PhotoGrid from "@/components/photo-grid"
import HomepageTextBlock from "@/components/homepage-text-block"
import VerticalImageCarousel from "@/components/vertical-image-carousel"
import SecondaryTextBlock from "@/components/secondary-text-block"
import SecondaryPhotoGrid from "@/components/secondary-photo-grid"
import ChatPopup from "@/components/chat-popup"

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
        <div className="text-3xl text-[#ffd6c0] animate-pulse">hai.</div>
      </div>
    )
  }

  return (
    <>
      <Header />
      <NewsletterPopup />
      <ChatPopup />
      <div className="relative overflow-hidden">
        <div className="relative z-10">
          {/* Main content area with full-width image carousel */}
          <div className="min-h-screen pt-24 px-6 pb-6 flex flex-col">
            <div className="flex-grow flex flex-col">
              {/* Full-width media carousel - removed fixed height constraint */}
              <div className="w-full mb-8">
                <HomeMediaCarousel />
              </div>

              {/* First section: Text and photo grid */}
              <div className="w-full py-12">
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Homepage Text Block */}
                    <div className="w-full md:w-1/2">
                      <HomepageTextBlock />
                    </div>

                    {/* Photo Grid */}
                    <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
                      <PhotoGrid />
                    </div>
                  </div>
                </div>
              </div>

              {/* Vertical Image Carousel Section */}
              <div className="w-full py-12">
                <div className="container mx-auto">
                  <VerticalImageCarousel />
                </div>
              </div>

              {/* Second section: Text and photo grid */}
              <div className="w-full py-12">
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row-reverse items-center justify-between gap-8">
                    {/* Secondary Text Block (flipped position) */}
                    <div className="w-full md:w-1/2">
                      <SecondaryTextBlock />
                    </div>

                    {/* Secondary Photo Grid (flipped position) */}
                    <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
                      <SecondaryPhotoGrid />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
