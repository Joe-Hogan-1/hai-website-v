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

export default function BlogPostPage({ params }: BlogPostPageProps) {
  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
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

  const { data: post } = await supabase.from("blog_posts").select("*").eq("id", id).single()

  if (!post) {
    notFound()
  }

  return <BlogPost post={post} />
}

function BlogPostSkeleton() {
  return (
    <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md animate-pulse">
      <div className="h-8 bg-gray-200 rounded w-3/4 mb-6"></div>
      <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
      <div className="h-64 bg-gray-200 rounded mb-8"></div>
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded"></div>
        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
      </div>
    </div>
  )
}
