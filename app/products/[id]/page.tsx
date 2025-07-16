import type React from "react"
import { supabase } from "@/utils/supabase"
import Header from "@/components/header"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category?: "Indica" | "Sativa" | "Hybrid" | null
  product_category?: string | null
}

interface ProductCategory {
  name: string
  color: string | null
}

// Helper to determine if a color is light or dark for text contrast
const isColorLight = (hexColor: string | null): boolean => {
  if (!hexColor) return false
  const color = hexColor.startsWith("#") ? hexColor.substring(1, 7) : hexColor
  if (color.length !== 6) return false
  const r = Number.parseInt(color.substring(0, 2), 16)
  const g = Number.parseInt(color.substring(2, 4), 16)
  const b = Number.parseInt(color.substring(4, 6), 16)
  const yiq = (r * 299 + g * 587 + b * 114) / 1000
  return yiq >= 128
}

const getStrainBadgeStyle = (category?: string | null) => {
  switch (category) {
    case "Indica":
      return { backgroundColor: "#c9a3c8", color: "#FFFFFF" }
    case "Sativa":
      return { backgroundColor: "#c73b3a", color: "#FFFFFF" }
    case "Hybrid":
      return { backgroundColor: "#9bc3d8", color: "#FFFFFF" }
    default:
      return { backgroundColor: "#F3F4F6", color: "#374151" }
  }
}

const getProductCategoryStyle = (
  categoryName: string | null | undefined,
  allCategories: ProductCategory[],
): React.CSSProperties => {
  if (!categoryName) return {}
  const category = allCategories.find((c) => c.name === categoryName)
  const bgColor = category?.color || "#6B7280"
  return {
    backgroundColor: bgColor,
    color: isColorLight(bgColor) ? "#000000" : "#FFFFFF",
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const productPromise = supabase.from("products").select("*").eq("id", params.id).single()
  const categoriesPromise = supabase.from("product_categories").select("name, color")

  const [{ data: product, error }, { data: categories }] = await Promise.all([productPromise, categoriesPromise])

  if (error || !product) {
    notFound()
  }

  const allCategories: ProductCategory[] = categories || []
  const strainStyle = getStrainBadgeStyle(product.category)
  const categoryStyle = getProductCategoryStyle(product.product_category, allCategories)

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-0">
          <div className="bg-white rounded-lg shadow-md overflow-hidden my-8">
            <div className="p-4 sm:p-6 md:p-8">
              <Link href="/products" className="inline-flex items-center text-black hover:text-gray-700 mb-6">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Products
              </Link>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Product Image */}
                <div className="relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={product.image_url || "/placeholder.svg?height=600&width=600"}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="absolute top-4 left-4 flex flex-col gap-2">
                    {product.category && (
                      <Badge style={strainStyle} className="border-none">
                        {product.category}
                      </Badge>
                    )}
                    {product.product_category && (
                      <Badge style={categoryStyle} className="border-none">
                        {product.product_category}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Product Details */}
                <div>
                  <h1 className="text-3xl font-bold text-black mb-4 text-left">{product.name}</h1>

                  <div className="prose prose-sm max-w-none text-gray-700 text-left">
                    <p className="whitespace-pre-line">{product.description}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
