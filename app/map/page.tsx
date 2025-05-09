"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import dynamic from "next/dynamic"

// Use dynamic import with ssr: false for the map component
const DispensaryMapClient = dynamic(() => import("@/components/dispensary-map-client"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

function MapLoadingSkeleton() {
  return (
    <div className="h-[600px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
      <div className="w-16 h-16 border-4 border-[#ffd6c0] border-t-transparent rounded-full mb-4 animate-spin"></div>
      <div>
        <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
        <p className="text-gray-500 mt-2 text-center">Please wait while we load the dispensary locations...</p>
      </div>
    </div>
  )
}

export default function MapPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <h1 className="text-5xl font-bold mb-6 text-black">find hai.</h1>
          <p className="text-xl mb-8 text-black">
            Discover licensed dispensaries in New York State where hai. products are available.
          </p>

          <Suspense fallback={<MapLoadingSkeleton />}>
            <DispensaryMapClient />
          </Suspense>
        </div>
      </div>
    </>
  )
}
