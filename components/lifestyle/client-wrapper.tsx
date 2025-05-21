"use client"

import dynamic from "next/dynamic"
import { Suspense } from "react"

// Dynamically import components with ssr: false
const DynamicConnectWithUsSection = dynamic(() => import("./connect-with-us-section"), {
  ssr: false,
  loading: () => <ConnectWithUsSectionSkeleton />,
})

function ConnectWithUsSectionSkeleton() {
  return (
    <div className="w-full mt-12 p-8 bg-gray-100 rounded-lg animate-pulse">
      <div className="h-8 w-64 bg-gray-300 rounded mb-4"></div>
      <div className="h-4 w-full bg-gray-300 rounded mb-2"></div>
      <div className="h-4 w-3/4 bg-gray-300 rounded mb-6"></div>
      <div className="h-10 w-40 bg-gray-300 rounded"></div>
    </div>
  )
}

export default function ConnectWithUsClientWrapper() {
  return (
    <Suspense fallback={<ConnectWithUsSectionSkeleton />}>
      <DynamicConnectWithUsSection />
    </Suspense>
  )
}
