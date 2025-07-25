"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import HomeMediaCarousel from "@/components/home-media-carousel"
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
      <ChatPopup />
      <div className="relative overflow-hidden">
        <div className="relative z-10">
          {/* Main content area with full-width image carousel */}
          <div className="min-h-screen pt-24 px-6 pb-12 flex flex-col">
            <div className="flex-grow flex flex-col">
              {/* Full-width media carousel */}
              <div className="w-full mb-16">
                <HomeMediaCarousel />
              </div>

              {/* Shop Essentials Section */}
              <div className="w-full mb-16 text-center">
                <p className="text-xl md:text-2xl font-medium mb-4 md:mb-6">
                  from sunrise to after hours - we've got you.
                </p>
                <Link
                  href="/products"
                  className="inline-flex px-6 py-3 bg-black text-white hover:bg-gray-800 transition-colors text-sm font-medium"
                >
                  Shop Essentials
                </Link>
              </div>

              {/* First section: Text and photo grid */}
              <div className="w-full py-4">
                <div className="max-w-7xl mx-auto">
                  <div className="flex flex-col md:flex-row items-start justify-between gap-8">
                    {/* Homepage Text Block */}
                    <div className="w-full py-8 md:py-32">
                      <div className="max-w-none md:max-w-sm">
                        <HomepageTextBlock />
                      </div>
                    </div>
                    {/* Photo Grid */}
                    <div className="w-full">
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

              {/* Secondary Photo Grid and Text Block in a vertical layout */}
              <div className="w-full py-1">
                <div className="w-full px-1 flex flex-col">
                  <SecondaryPhotoGrid />
                </div>
                <div className="w-full items-center text-center px-4 mt-8">
                  <SecondaryTextBlock />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
