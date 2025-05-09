"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import BlogManager from "@/components/admin/blog-manager"
import ProductManager from "@/components/admin/product-manager"
import BreakingNewsManager from "@/components/admin/breaking-news-manager"
import MediaManager from "@/components/admin/media-manager"
import DispensaryManager from "@/components/admin/dispensary-manager"
import NewsletterManager from "@/components/admin/newsletter-manager"
import GridImageManager from "@/components/admin/grid-image-manager"
import CategoryManager from "@/components/admin/category-manager"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"
import VideoManager from "@/components/admin/video-manager"
import DatabaseDebug from "@/components/admin/database-debug"
import StorageBucketDiagnostic from "@/components/admin/storage-bucket-diagnostic"
import LifestyleBannerManager from "@/components/admin/lifestyle-banner-manager"

export default function AdminDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("media")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const tabParam = searchParams.get("tab")
    if (tabParam) {
      setActiveTab(tabParam)
    }
  }, [searchParams])

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

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsMobileMenuOpen(false)
    router.push(`/dashboard?tab=${value}`, { scroll: false })
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

  const tabItems = [
    { id: "media", label: "Homepage Carousel" },
    { id: "lifestyle-banner", label: "Lifestyle Banner" },
    { id: "grid-images", label: "Photo Grid" },
    { id: "blogs", label: "Blog Management" },
    { id: "products", label: "Product Management" },
    { id: "categories", label: "Categories" },
    { id: "dispensaries", label: "Dispensary Locations" },
    { id: "newsletter", label: "Newsletter" },
    { id: "videos", label: "Videos" },
    { id: "database-debug", label: "Database Debug" },
    { id: "storage-diagnostic", label: "Storage Diagnostic" },
  ]

  return (
    <>
      <WaterBackground />
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-lg p-6 mb-6 admin-panel">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-[#ffd6c0]">Admin Dashboard</h1>
              <div className="flex items-center gap-4">
                <p className="text-gray-600 hidden md:block">Welcome, {user.email}</p>
                <button
                  onClick={handleSignOut}
                  className="bg-[#ffd6c0] text-white py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all button-hover"
                >
                  Sign Out
                </button>

                {/* Mobile menu button - only visible on mobile */}
                <div className="md:hidden">
                  <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <button className="p-2 text-gray-600 hover:text-gray-900">
                        <Menu size={24} />
                      </button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[80vw] sm:w-[385px] p-0">
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center">
                          <h2 className="text-xl font-semibold">Dashboard Menu</h2>
                          <button onClick={() => setIsMobileMenuOpen(false)}>
                            <X size={24} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <div className="space-y-1">
                            {tabItems.map((tab) => (
                              <button
                                key={tab.id}
                                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                                  activeTab === tab.id ? "bg-[#ffd6c0] text-white" : "hover:bg-gray-100"
                                }`}
                                onClick={() => handleTabChange(tab.id)}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 border-t">
                          <p className="text-sm text-gray-500 mb-2">Logged in as:</p>
                          <p className="font-medium truncate">{user.email}</p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
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

            {/* Desktop dropdown menu - hidden on mobile */}
            <div className="hidden md:block">
              <div className="flex items-center mb-8">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center gap-2 bg-[#ffd6c0] text-white py-2 px-4 rounded-lg hover:bg-opacity-90 transition-all">
                    {tabItems.find((tab) => tab.id === activeTab)?.label || "Select Section"}
                    <ChevronDown className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="w-56">
                    {tabItems.map((tab) => (
                      <DropdownMenuItem
                        key={tab.id}
                        onClick={() => handleTabChange(tab.id)}
                        className={activeTab === tab.id ? "bg-[#ffd6c0]/10 font-medium" : ""}
                      >
                        {tab.label}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <TabsContent value="media">
                  <MediaManager userId={user.id} />
                </TabsContent>

                <TabsContent value="lifestyle-banner">
                  <LifestyleBannerManager userId={user.id} />
                </TabsContent>

                <TabsContent value="grid-images">
                  <GridImageManager userId={user.id} />
                </TabsContent>

                <TabsContent value="blogs">
                  <BlogManager userId={user.id} />
                </TabsContent>

                <TabsContent value="products">
                  <ProductManager userId={user.id} />
                </TabsContent>

                <TabsContent value="categories">
                  <CategoryManager />
                </TabsContent>

                <TabsContent value="dispensaries">
                  <DispensaryManager userId={user.id} />
                </TabsContent>

                <TabsContent value="newsletter">
                  <NewsletterManager />
                </TabsContent>

                <TabsContent value="videos">
                  <VideoManager userId={user.id} />
                </TabsContent>

                <TabsContent value="database-debug">
                  <DatabaseDebug />
                </TabsContent>

                <TabsContent value="storage-diagnostic">
                  <StorageBucketDiagnostic />
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile tab content - shown based on active tab */}
            <div className="md:hidden">
              {activeTab === "media" && <MediaManager userId={user.id} />}
              {activeTab === "lifestyle-banner" && <LifestyleBannerManager userId={user.id} />}
              {activeTab === "grid-images" && <GridImageManager userId={user.id} />}
              {activeTab === "blogs" && <BlogManager userId={user.id} />}
              {activeTab === "products" && <ProductManager userId={user.id} />}
              {activeTab === "categories" && <CategoryManager />}
              {activeTab === "dispensaries" && <DispensaryManager userId={user.id} />}
              {activeTab === "newsletter" && <NewsletterManager />}
              {activeTab === "videos" && <VideoManager userId={user.id} />}
              {activeTab === "database-debug" && <DatabaseDebug />}
              {activeTab === "storage-diagnostic" && <StorageBucketDiagnostic />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
