"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import with ssr: false in a client component
const DynamicBlogCarousel = dynamic(() => import("./horizontal-blog-carousel"), {
  ssr: false,
  loading: () => <BlogCarouselSkeleton />,
})

function BlogCarouselSkeleton() {
  return (
    <div className="w-full h-full flex overflow-x-auto pb-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="min-w-[300px] h-[400px] bg-gray-200 rounded-lg mr-4 animate-pulse flex-shrink-0">
          <div className="h-[200px] bg-gray-300 rounded-t-lg"></div>
          <div className="p-4">
            <div className="h-6 bg-gray-300 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-gray-300 rounded w-full mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-5/6 mb-4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/4 mt-6"></div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function BlogCarouselWrapper() {
  return (
    <Suspense fallback={<BlogCarouselSkeleton />}>
      <DynamicBlogCarousel />
    </Suspense>
  )
}
