import Header from "@/components/header"
import LifestyleBanner from "@/components/lifestyle/lifestyle-banner"
import { BlogList } from "@/components/blog/blog-list"

export const metadata = {
  title: "Lifestyle | hai",
  description: "Explore cannabis lifestyle articles, tips, and stories.",
}

export default function LifestylePage() {
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 pt-12 pb-16">
          <h1 className="text-4xl font-bold mb-6">Lifestyle</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-[500px]">
              <LifestyleBanner />
            </div>

            <div className="bg-[#ffd6c0]/50 rounded-lg p-4">
              <h2 className="text-2xl font-semibold mb-4">Latest Articles</h2>
              <BlogList limit={5} showExcerpt={false} className="vertical-carousel" />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
