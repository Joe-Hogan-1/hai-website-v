import Header from "@/components/header"
import dynamic from "next/dynamic"

// Import the client components properly
const LifestyleBanner = dynamic(() => import("@/components/lifestyle/lifestyle-banner"), {
  ssr: true,
})

const LifestyleContentBlock = dynamic(() => import("@/components/lifestyle/lifestyle-content-block"), {
  ssr: true,
})

// Use a client wrapper for BlogList if it contains client-only features
import { BlogListWrapper } from "@/components/blog/blog-list-wrapper"

export const metadata = {
  title: "Lifestyle | hai",
  description: "Explore cannabis lifestyle articles, tips, and stories.",
}

export default function LifestylePage() {
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-0">
          <h1 className="text-4xl font-bold mb-2 text-center">lifestyle</h1>

          <div className="lifestyle-content px-4 pt-2">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LifestyleBanner />
                <LifestyleContentBlock />
              </div>

              <div className="bg-[#ffd6c0]/50 rounded-lg p-4">
                <h2 className="text-2xl font-semibold mb-4">Latest Articles</h2>
                <div className="h-[375px] overflow-y-auto pr-2 custom-scrollbar">
                  <BlogListWrapper limit={10} showExcerpt={true} className="space-y-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
