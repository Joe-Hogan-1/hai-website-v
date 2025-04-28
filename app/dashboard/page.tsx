"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BlogManager from "@/components/admin/blog-manager"
import ProductManager from "@/components/admin/product-manager"
import BreakingNewsManager from "@/components/admin/breaking-news-manager"
import MediaManager from "@/components/admin/media-manager"
import DispensaryManager from "@/components/admin/dispensary-manager"
import NewsletterManager from "@/components/admin/newsletter-manager"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const checkUser = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (user) {
          setUser(user)
        } else {
          router.push("/signin")
        }
      } catch (error) {
        router.push("/signin")
      } finally {
        setLoading(false)
      }
    }

    checkUser()
  }, [router])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/signin")
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-3xl text-[#ffd6c0]">Loading...</div>
      </div>
    )
  }

  if (!user) {
    return null // Router will redirect, this prevents flash of content
  }

  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#ffd6c0]">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600">Welcome, {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="bg-[#ffd6c0] text-white py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all button-hover"
                >
                  Sign Out
                </button>
              </div>
            </div>

            <div className="mb-8">
              <BreakingNewsManager />
            </div>

            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                <strong>Note:</strong> Use the Breaking News section above to add an announcement that will appear at
                the top of all pages. If you don't see the breaking news bar, make sure you've added some text in the
                field above and clicked "Save Breaking News".
              </p>
            </div>

            <Tabs defaultValue="media" className="w-full">
              <TabsList className="grid w-full grid-cols-5 mb-8">
                <TabsTrigger value="media">Media Banner</TabsTrigger>
                <TabsTrigger value="blogs">Blog Management</TabsTrigger>
                <TabsTrigger value="products">Product Management</TabsTrigger>
                <TabsTrigger value="dispensaries">Dispensary Locations</TabsTrigger>
                <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              </TabsList>

              <TabsContent value="media">
                <MediaManager userId={user.id} />
              </TabsContent>

              <TabsContent value="blogs">
                <BlogManager userId={user.id} />
              </TabsContent>

              <TabsContent value="products">
                <ProductManager userId={user.id} />
              </TabsContent>

              <TabsContent value="dispensaries">
                <DispensaryManager userId={user.id} />
              </TabsContent>

              <TabsContent value="newsletter">
                <NewsletterManager />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </>
  )
}
