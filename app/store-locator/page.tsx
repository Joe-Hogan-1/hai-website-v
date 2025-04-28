import { Suspense } from "react"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import StoreLocatorClient from "@/components/store-locator-client"

function LoadingPlaceholder() {
  return (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-2xl font-bold text-gray-600">Loading Map...</div>
    </div>
  )
}

export default function StoreLocatorPage() {
  return (
    <div className="flex justify-center items-center p-6 bg-gray-100">
      <WaterBackground />
      <Header />
      <div className="w-full max-w-6xl">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">New York State Store Locator</h1>
        <Suspense fallback={<LoadingPlaceholder />}>
          <StoreLocatorClient />
        </Suspense>
      </div>
    </div>
  )
}
