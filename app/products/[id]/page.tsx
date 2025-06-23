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

// Function to get category badge color
const getCategoryColor = (category?: string | null) => {
  switch (category) {
    case "Indica":
      return "bg-[#c9a3c8] text-white"
    case "Sativa":
      return "bg-[#c73b3a] text-white"
    case "Hybrid":
      return "bg-[#9bc3d8] text-white"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

// Function to get product category badge color
const getProductCategoryColor = (category?: string | null) => {
  switch (category) {
    case "Flower":
      return "bg-green-500 text-white"
    case "Pre-Rolls":
      return "bg-orange-500 text-white"
    case "Edibles":
      return "bg-pink-500 text-white"
    case "Merch":
      return "bg-blue-500 text-white"
    case "Concentrates":
      return "bg-purple-500 text-white"
    case "Vapes":
      return "bg-teal-500 text-white"
    default:
      return "bg-gray-200 text-gray-700"
  }
}

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const { data: product, error } = await supabase.from("products").select("*").eq("id", params.id).single()

  if (error || !product) {
    notFound()
  }

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
                      <Badge className={`${getCategoryColor(product.category)}`}>{product.category}</Badge>
                    )}
                    {product.product_category && (
                      <Badge className={`${getProductCategoryColor(product.product_category)}`}>
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
