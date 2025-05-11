import { Suspense } from "react"
import dynamic from "next/dynamic"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"

// Force static generation for this page
export const forceStatic = "force-static"
export const revalidate = 3600 // Revalidate every hour

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

export default function MapPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 pt-24 pb-8">
          <h1 className="text-5xl font-bold mb-6 text-black">find hai.</h1>
          <p className="text-xl mb-8 text-black text-center">
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
