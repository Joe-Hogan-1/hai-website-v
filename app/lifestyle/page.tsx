import Header from "@/components/header"
import LeftAlignedTitle from "@/components/left-aligned-title"
import LifestyleBanner from "@/components/lifestyle/lifestyle-banner"
import LifestyleContentBlock from "@/components/lifestyle/lifestyle-content-block"
import BlogCarouselWrapper from "@/components/blog/blog-carousel-wrapper"
import ConnectWithUsClientWrapper from "@/components/lifestyle/client-wrapper"

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

              <div className="w-full h-[520px]">
                <BlogCarouselWrapper />
              </div>
            </div>

            {/* Connect with us section */}
            <ConnectWithUsClientWrapper />
          </div>
        </div>
      </div>
    </>
  )
}
