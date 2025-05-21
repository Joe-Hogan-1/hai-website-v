"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import with ssr: false in a client component
const DynamicConnectWithUsSection = dynamic(() => import("./connect-with-us-section"), {
  ssr: false,
  loading: () => <ConnectWithUsSectionSkeleton />,
})

function ConnectWithUsSectionSkeleton() {
  return (
    <div className="w-full my-12 px-4 py-10 bg-gray-100 rounded-lg max-w-6xl mx-auto animate-pulse">
      <div className="max-w-3xl mx-auto text-center">
        <div className="h-8 w-64 bg-gray-300 rounded mx-auto mb-4"></div>
        <div className="h-4 w-full bg-gray-300 rounded mb-2 max-w-xl mx-auto"></div>
        <div className="h-4 w-3/4 bg-gray-300 rounded mb-6 max-w-xl mx-auto"></div>
        <div className="h-12 w-48 bg-gray-300 rounded mx-auto"></div>
      </div>
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
