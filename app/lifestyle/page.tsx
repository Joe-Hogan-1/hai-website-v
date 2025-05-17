import Header from "@/components/header"
import dynamic from "next/dynamic"
import LeftAlignedTitle from "@/components/left-aligned-title"

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
        <div className="container mx-auto">
          <LeftAlignedTitle>lifestyle</LeftAlignedTitle>
          <div className="lifestyle-content px-4 pb-16">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <LifestyleBanner />
                <LifestyleContentBlock />
              </div>

              <div className="bg-[#ffd6c0]/50 rounded-lg p-4 flex flex-col h-full min-h-[600px]">
                <h2 className="text-2xl font-semibold mb-1 text-left">the journal</h2>
                <p className="text-sm mb-4 text-left text-gray-600">rituals, routines, and how we really live</p>
                <div
                  className="flex-grow overflow-y-auto pr-2 custom-scrollbar"
                  style={{ height: "500px", minHeight: "500px" }}
                >
                  <BlogListWrapper limit={20} showExcerpt={true} className="space-y-3" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
