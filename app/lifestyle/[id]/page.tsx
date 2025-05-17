import { Suspense } from "react"
import { notFound } from "next/navigation"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import BlogPost from "@/components/blog/blog-post"
import { createServerClient } from "@/utils/supabase-server"

interface BlogPostPageProps {
  params: {
    id: string
  }
}

export default function LifestylePostPage({ params }: BlogPostPageProps) {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-0 py-6 pt-8">
          <Suspense fallback={<BlogPostSkeleton />}>
            <BlogPostContent id={params.id} />
          </Suspense>
        </div>
      </div>
    </>
  )
}

async function BlogPostContent({ id }: { id: string }) {
  const supabase = createServerClient()

  try {
    const { data: post, error } = await supabase.from("blog_posts").select("*").eq("id", id).single()

    if (error || !post) {
      // If the post doesn't exist or there's an error, create a fallback post
      if (error?.message.includes("does not exist") || !post) {
        const fallbackPost = {
          id,
          title: "Sample Blog Post",
          content:
            "This is a sample blog post content. The actual post could not be loaded.\n\nPlease check back later or try another post.",
          image_url: "/placeholder.svg?height=400&width=800",
          created_at: new Date().toISOString(),
        }
        return <BlogPost post={fallbackPost} />
      }

      // For other errors, throw to the notFound
      notFound()
    }

    return <BlogPost post={post} />
  } catch (error) {
    // For unexpected errors, also use notFound
    notFound()
  }
}

function BlogPostSkeleton() {
  return (
    <div className="max-w-5xl mx-auto bg-white/30 backdrop-blur-sm p-8 rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-white/40 rounded w-3/4 mb-6"></div>
      <div className="h-4 bg-white/40 rounded w-1/4 mb-8"></div>
      <div className="h-64 bg-white/40 rounded mb-8"></div>
      <div className="space-y-3">
        <div className="h-4 bg-white/40 rounded"></div>
        <div className="h-4 bg-white/40 rounded"></div>
        <div className="h-4 bg-white/40 rounded w-5/6"></div>
        <div className="h-4 bg-white/40 rounded w-4/6"></div>
      </div>
    </div>
  )
}
