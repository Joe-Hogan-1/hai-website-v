"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Header from "@/components/header"
import HomeMediaCarousel from "@/components/home-media-carousel"
import NewsletterPopup from "@/components/newsletter-popup"
import PhotoGrid from "@/components/photo-grid"

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
      <div className="relative overflow-hidden">
        <div className="relative z-10">
          {/* Main content area with full-width image carousel */}
          <div className="min-h-screen pt-24 px-6 pb-6 flex flex-col">
            <div className="flex-grow flex flex-col">
              {/* Full-width media carousel - removed fixed height constraint */}
              <div className="w-full mb-8">
                <HomeMediaCarousel />
              </div>

              {/* Tagline and photo grid section */}
              <div className="w-full py-12">
                <div className="container mx-auto">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                    {/* Tagline - Updated text */}
                    <div className="text-center md:text-left md:w-1/2">
                      <h2 className="text-3xl font-bold mb-4 text-black text-left">embrace the glow</h2>
                      <p className="text-xl text-black mb-6">
                        discover the intersection of wellness and a life well lived
                      </p>
                      {/* Updated button text */}
                      <Link
                        href="/products"
                        className="inline-flex px-6 py-3 bg-black text-white rounded-md border border-white/20 hover:bg-gray-800 transition-colors font-medium"
                      >
                        shop essentials
                      </Link>
                    </div>

                    {/* Photo Grid */}
                    <div className="w-full md:w-1/2 max-w-md mx-auto md:mx-0">
                      <PhotoGrid />
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
