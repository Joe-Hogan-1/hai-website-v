"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, X } from "lucide-react"
import dynamic from "next/dynamic"

// Dynamically import admin components
const BlogManager = dynamic(() => import("@/components/admin/blog-manager"), { ssr: false })
const ProductManager = dynamic(() => import("@/components/admin/product-manager"), { ssr: false })
const BreakingNewsManager = dynamic(() => import("@/components/admin/breaking-news-manager"), { ssr: false })
const MediaManager = dynamic(() => import("@/components/admin/media-manager"), { ssr: false })
const DispensaryManager = dynamic(() => import("@/components/admin/dispensary-manager"), { ssr: false })
const NewsletterManager = dynamic(() => import("@/components/admin/newsletter-manager"), { ssr: false })
const GridImageManager = dynamic(() => import("@/components/admin/grid-image-manager"), { ssr: false })
const CategoryManager = dynamic(() => import("@/components/admin/category-manager"), { ssr: false })
const LifestyleBannerManager = dynamic(() => import("@/components/admin/lifestyle-banner-manager"), { ssr: false })
const LifestyleContentManager = dynamic(() => import("@/components/admin/lifestyle-content-manager"), { ssr: false })
const ComingSoonManager = dynamic(() => import("@/components/admin/coming-soon-manager"), { ssr: false })

// Import other components
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

export default function AdminDashboard() {
  const { user, isLoading, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState("media")
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const router = useRouter()

  // Handle auth state
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/signin")
    }
  }, [isLoading, user, router])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse text-3xl text-[#ffd6c0]">Loading...</div>
      </div>
    )
  }

  // If not authenticated and not loading, don't render anything
  // The useEffect will handle the redirect
  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-3xl text-[#ffd6c0]">Redirecting to login...</div>
      </div>
    )
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      router.push("/signin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setIsMobileMenuOpen(false)
  }

  const tabItems = [
    { id: "coming-soon", label: "Coming Soon Page" },
    { id: "media", label: "Homepage Carousel" },
    { id: "lifestyle-banner", label: "Lifestyle Banner" },
    { id: "lifestyle-content", label: "Lifestyle Content" },
    { id: "grid-images", label: "Photo Grid" },
    { id: "blogs", label: "Blog Management" },
    { id: "products", label: "Product Management" },
    { id: "categories", label: "Categories" },
    { id: "dispensaries", label: "Dispensary Locations" },
    { id: "newsletter", label: "Newsletter" },
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
                  className="bg-[#ffd6c0] text-white py-2 px-4 rounded-lg hover:bg-opacity-80 transition-all button-hover font-medium"
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
                    <SheetContent side="right" className="bg-white border-none p-0 w-[80vw] sm:w-[385px]">
                      <div className="flex flex-col h-full">
                        <div className="p-4 border-b flex justify-between items-center">
                          <h2 className="text-xl font-semibold text-gray-800">Dashboard Menu</h2>
                          <button onClick={() => setIsMobileMenuOpen(false)} className="text-gray-600">
                            <X size={24} />
                          </button>
                        </div>
                        <div className="flex-1 overflow-auto p-4">
                          <div className="space-y-1">
                            {tabItems.map((tab) => (
                              <button
                                key={tab.id}
                                className={`w-full text-left px-4 py-3 rounded-md transition-colors ${
                                  activeTab === tab.id ? "bg-[#ffd6c0] text-white" : "text-gray-700 hover:bg-gray-100"
                                }`}
                                onClick={() => handleTabChange(tab.id)}
                              >
                                {tab.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div className="p-4 border-t border-gray-200">
                          <p className="text-sm text-gray-500 mb-2">Logged in as:</p>
                          <p className="font-medium truncate text-gray-700">{user.email}</p>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>
              </div>
            </div>

            <div className="mb-8">
              <BreakingNewsManager userId={user.id} />
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
                <TabsContent value="coming-soon">
                  <ComingSoonManager userId={user.id} />
                </TabsContent>

                <TabsContent value="media">
                  <MediaManager userId={user.id} />
                </TabsContent>

                <TabsContent value="lifestyle-banner">
                  <LifestyleBannerManager userId={user.id} />
                </TabsContent>

                <TabsContent value="lifestyle-content">
                  <LifestyleContentManager userId={user.id} />
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
                  <CategoryManager userId={user.id} />
                </TabsContent>

                <TabsContent value="dispensaries">
                  <DispensaryManager userId={user.id} />
                </TabsContent>

                <TabsContent value="newsletter">
                  <NewsletterManager userId={user.id} />
                </TabsContent>
              </Tabs>
            </div>

            {/* Mobile tab content - shown based on active tab */}
            <div className="md:hidden">
              {activeTab === "coming-soon" && <ComingSoonManager userId={user.id} />}
              {activeTab === "media" && <MediaManager userId={user.id} />}
              {activeTab === "lifestyle-banner" && <LifestyleBannerManager userId={user.id} />}
              {activeTab === "lifestyle-content" && <LifestyleContentManager userId={user.id} />}
              {activeTab === "grid-images" && <GridImageManager userId={user.id} />}
              {activeTab === "blogs" && <BlogManager userId={user.id} />}
              {activeTab === "products" && <ProductManager userId={user.id} />}
              {activeTab === "categories" && <CategoryManager userId={user.id} />}
              {activeTab === "dispensaries" && <DispensaryManager userId={user.id} />}
              {activeTab === "newsletter" && <NewsletterManager userId={user.id} />}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
