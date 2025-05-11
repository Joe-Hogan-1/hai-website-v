"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Create a loading component
const MapLoadingSkeleton = () => (
  <div className="h-[600px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg">
    <div className="w-16 h-16 border-4 border-[#ffd6c0] border-t-transparent rounded-full mb-4 animate-spin"></div>
    <div>
      <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
      <p className="text-gray-500 mt-2 text-center">Please wait while we load the dispensary locations...</p>
    </div>
  </div>
)

// Dynamically import the map client component with SSR disabled
const DispensaryMapClient = dynamic(() => import("@/components/dispensary-map-client"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

export default function MapClientWrapper() {
  return (
    <Suspense fallback={<MapLoadingSkeleton />}>
      <DispensaryMapClient />
    </Suspense>
  )
}
