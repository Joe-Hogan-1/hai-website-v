import { Suspense } from "react"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import BlogList from "@/components/blog/blog-list"

export default function BlogPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-5xl font-bold mb-6 text-black">blog</h1>
          <p className="text-xl mb-12 text-black">
            stay tuned for our latest articles and updates on wellness and lifestyle.
          </p>

          <Suspense fallback={<BlogLoadingSkeleton />}>
            <BlogList />
          </Suspense>
        </div>
      </div>
    </>
  )
}

function BlogLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3, 4, 5, 6].map((item) => (
        <div key={item} className="bg-white p-6 rounded-lg shadow-md animate-pulse">
          <div className="h-40 bg-gray-200 rounded mb-4"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4 mb-3"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-4/6 mb-4"></div>
          <div className="h-8 bg-gray-200 rounded-full w-1/3"></div>
        </div>
      ))}
    </div>
  )
}
