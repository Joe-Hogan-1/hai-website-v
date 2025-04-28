import { Suspense } from "react"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import MapPageClient from "@/components/map-page-client"

function MapLoadingSkeleton() {
  return (
    <div className="h-[600px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg animate-pulse">
      <div className="w-16 h-16 border-4 border-[#ffd6c0] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
      <p className="text-gray-500 mt-2">Please wait while we load the dispensary locations...</p>
    </div>
  )
}

export default function MapPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-6 text-[#ffd6c0]">find hai.</h1>
          <p className="text-xl mb-8 text-black">
            Discover licensed dispensaries in New York State where hai. products are available.
          </p>

          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapPageClient />
          </Suspense>
        </div>
      </div>
    </>
  )
}
