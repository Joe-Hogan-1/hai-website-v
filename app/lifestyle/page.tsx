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

// Rename to HorizontalBlogCarousel for clarity
const HorizontalBlogCarousel = dynamic(() => import("@/components/blog/horizontal-blog-carousel"), {
  ssr: false,
})

const ConnectWithUsSection = dynamic(() => import("@/components/lifestyle/connect-with-us-section"), {
  ssr: true,
})

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
          <LeftAlignedTitle>essentials and rituals.</LeftAlignedTitle>
          <p className="text-lg md:text-xl mt-[-0.5rem] mb-6 text-left text-gray-600 max-w-2xl font-medium pl-8">
            born in the glow of the city lights.
          </p>

          <div className="lifestyle-content px-4 pb-8">
            {/* Full-width lifestyle content */}
            <div className="w-full">
              <LifestyleBanner />
              <LifestyleContentBlock />
            </div>

            {/* Blog carousel section with peach background */}
            <div className="mt-12 mb-16 bg-[#FFDECB] p-6 rounded-lg">
              <h2 className="text-2xl font-semibold mb-4 text-left">the journal.</h2>
              <p className="text-sm mb-6 text-left text-gray-600">rituals, routines, and how we really live.</p>

              <div className="w-full h-[320px]">
                <HorizontalBlogCarousel />
              </div>
            </div>

            {/* Connect with us section */}
            <ConnectWithUsSection />
          </div>
        </div>
      </div>
    </>
  )
}
