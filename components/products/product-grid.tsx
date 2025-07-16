"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category?: "Indica" | "Sativa" | "Hybrid" | null
  product_category?: string | null
}

interface ProductCategory {
  id: string
  name: string
  is_active: boolean
  display_order: number
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

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [categoryStyles, setCategoryStyles] = useState<Record<string, { backgroundColor: string; color: string }>>({})

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        const { data: categoryData, error: categoryError } = await supabase
          .from("product_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })

        if (categoryError) {
          setCategories([])
        } else {
          const fetchedCategories = categoryData || []
          setCategories(fetchedCategories)
          const styles = fetchedCategories.reduce(
            (acc, cat) => {
              const backgroundColor = cat.color || "#6B7280" // Default gray
              acc[cat.name] = {
                backgroundColor,
                color: isColorLight(backgroundColor) ? "#000000" : "#FFFFFF",
              }
              return acc
            },
            {} as Record<string, { backgroundColor: string; color: string }>,
          )
          setCategoryStyles(styles)
        }

        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })

        if (productError) {
          setError(`Failed to load products: ${productError.message}`)
        } else {
          setProducts(productData || [])
          setError(null)
        }
      } catch (e) {
        if (e instanceof Error) setError(e.message)
        else setError("An unexpected error occurred")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const filteredProducts = activeCategory
    ? products.filter((product) => product.product_category === activeCategory)
    : products

  const getStrainBadgeStyle = (category?: string | null) => {
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

  function renderProduct(product: Product) {
    const productCategoryStyle = product.product_category ? categoryStyles[product.product_category] : null

    return (
      <Link
        key={product.id}
        href={`/products/${product.id}`}
        className="block bg-white rounded-lg overflow-hidden product-card border border-gray-200 transition-shadow duration-300 hover:shadow-lg"
      >
        <div className="h-64 overflow-hidden relative bg-gray-50">
          <img
            src={product.image_url || "/placeholder.svg?height=320&width=400"}
            alt={product.name}
            className="w-full h-full object-contain"
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.category && (
              <div className={`text-xs font-bold px-2 py-1 rounded-full ${getStrainBadgeStyle(product.category)}`}>
                {product.category}
              </div>
            )}
            {product.product_category && productCategoryStyle && (
              <div style={productCategoryStyle} className="text-xs font-bold px-2 py-1 rounded-full">
                {product.product_category}
              </div>
            )}
          </div>
        </div>
        <div className="p-5">
          <h2 className="text-2xl font-semibold text-black line-clamp-2 text-left mb-2 h-16">{product.name}</h2>
          <div className="relative">
            <p className="text-gray-700 text-sm font-medium line-clamp-3 text-left">{product.description}</p>
            <div className="read-more-link mt-2 text-black text-sm font-medium flex items-center underline">
              Read more <ArrowRight className="ml-1 h-3 w-3" />
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <>
      <div className="mb-8">
        <div className="flex flex-wrap gap-2 pl-[24px]">
          <Badge
            className={`cursor-pointer transition-colors ${
              !activeCategory ? "bg-[#ffd6c0] text-black" : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
            onClick={() => setActiveCategory(null)}
          >
            All Products
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              className="cursor-pointer transition-colors"
              style={
                activeCategory === category.name
                  ? categoryStyles[category.name]
                  : { backgroundColor: "#e5e7eb", color: "#374151" }
              }
              onClick={() => setActiveCategory(category.name)}
              onMouseEnter={(e) => {
                if (activeCategory !== category.name) {
                  e.currentTarget.style.backgroundColor = categoryStyles[category.name]?.backgroundColor || "#cbd5e1"
                  e.currentTarget.style.color = categoryStyles[category.name]?.color || "#000000"
                }
              }}
              onMouseLeave={(e) => {
                if (activeCategory !== category.name) {
                  e.currentTarget.style.backgroundColor = "#e5e7eb"
                  e.currentTarget.style.color = "#374151"
                }
              }}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white/30 backdrop-blur-sm rounded-lg p-6 animate-pulse h-96">
              <div className="h-80 bg-white/40 rounded-lg mb-4"></div>
              <div className="h-6 bg-white/40 rounded w-3/4 mb-3"></div>
              <div className="h-4 bg-white/40 rounded mb-2"></div>
              <div className="h-4 bg-white/40 rounded mb-2"></div>
              <div className="h-4 bg-white/40 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error:</strong>
          <span className="block sm:inline"> {error}</span>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg">
          <p className="text-xl text-black">No products in this category.</p>
          <p className="text-black mt-2">Check back soon or select another category!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => renderProduct(product))}
        </div>
      )}
    </>
  )
}
