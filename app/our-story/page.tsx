import Header from "@/components/header"
import LeftAlignedTitle from "@/components/left-aligned-title"

export default function OurStory() {
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto">
          <LeftAlignedTitle>our story</LeftAlignedTitle>
          <div className="story-content px-4">
            <div className="bg-[#ffd6c0] p-6 w-full max-w-4xl mx-auto rounded-sm min-h-[400px]">
              {/* Content for Our Story page */}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
