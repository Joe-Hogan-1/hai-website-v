"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useTilt } from "@/hooks/use-tilt"
import { Badge } from "@/components/ui/badge"
import { ChevronRight } from "lucide-react"
import ProductDetailModal from "./product-detail-modal"

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
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<ProductCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { tiltRef, handleMouseMove, handleMouseEnter, handleMouseLeave } = useTilt()
  const [activeCategory, setActiveCategory] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch categories first
        const { data: categoryData, error: categoryError } = await supabase
          .from("product_categories")
          .select("*")
          .eq("is_active", true)
          .order("display_order", { ascending: true })

        if (categoryError) {
          setCategories([])
        } else {
          setCategories(categoryData || [])
        }

        // Then fetch products
        const { data: productData, error: productError } = await supabase
          .from("products")
          .select("*")
          .order("created_at", { ascending: false })

        if (productError) {
          // If the table doesn't exist, use fallback data
          if (productError.message.includes("does not exist")) {
            setProducts(getFallbackProducts())
          } else {
            setError(`Failed to load products: ${productError.message}`)
            setProducts(getFallbackProducts())
          }
        } else {
          setProducts(productData && productData.length > 0 ? productData : getFallbackProducts())
          setError(null)
        }
      } catch (error) {
        setError("An unexpected error occurred while loading products")
        setProducts(getFallbackProducts())
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Add this function to provide fallback data
  function getFallbackProducts(): Product[] {
    return []
  }

  // Filter products by category
  const filteredProducts = activeCategory
    ? products.filter((product) => product.product_category === activeCategory)
    : products

  // Function to get category badge color
  const getCategoryColor = (category?: string | null) => {
    switch (category) {
      case "Indica":
        return "bg-purple-600 text-white"
      case "Sativa":
        return "bg-white text-black border border-gray-300"
      case "Hybrid":
        return "bg-yellow-400 text-black"
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

  const openProductModal = (product: Product) => {
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const closeProductModal = () => {
    setIsModalOpen(false)
    setSelectedProduct(null)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white/30 backdrop-blur-sm rounded-lg p-6 animate-pulse h-80">
            <div className="h-40 bg-white/40 rounded-lg mb-4"></div>
            <div className="h-6 bg-white/40 rounded w-3/4 mb-3"></div>
            <div className="h-4 bg-white/40 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-white/40 rounded mb-2"></div>
            <div className="h-10 bg-white/40 rounded mt-4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-white/30 backdrop-blur-sm rounded-lg p-6 text-center">
        <p className="text-red-500 mb-4">{error}</p>
        <p className="text-black">Showing fallback products instead</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
          {products.map((product) => renderProduct(product))}
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white/30 backdrop-blur-sm rounded-lg">
        <p className="text-xl text-black">No products available yet.</p>
        <p className="text-black mt-2">Check back soon for our product lineup!</p>
      </div>
    )
  }

  function renderProduct(product: Product) {
    return (
      <div
        key={product.id}
        ref={tiltRef as React.RefObject<HTMLDivElement>}
        onMouseMove={handleMouseMove}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="bg-white rounded-lg overflow-hidden transform-gpu transition-all duration-300 hover:shadow-xl product-card border border-gray-200"
        style={{
          transformStyle: "preserve-3d",
          boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)",
        }}
      >
        <div className="h-48 overflow-hidden relative">
          <img
            src={product.image_url || "/placeholder.svg?height=200&width=300"}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
            style={{ transform: "translateZ(20px)" }}
          />
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {product.category && (
              <div
                className={`${getCategoryColor(product.category)} text-xs font-bold px-2 py-1 rounded-full`}
                style={{ transform: "translateZ(40px)" }}
              >
                {product.category}
              </div>
            )}
            {product.product_category && (
              <div
                className={`${getProductCategoryColor(product.product_category)} text-xs font-bold px-2 py-1 rounded-full`}
                style={{ transform: "translateZ(40px)" }}
              >
                {product.product_category}
              </div>
            )}
          </div>
        </div>
        <div className="p-4" style={{ transform: "translateZ(30px)" }}>
          {/* First line: Product name */}
          <h2 className="text-xl font-semibold text-black line-clamp-1">{product.name}</h2>

          {/* Second line: Short description (first sentence) */}
          <p className="text-gray-700 text-sm mt-1 font-medium line-clamp-1">{product.description.split(".")[0]}.</p>

          {/* Third line: Area for 3 lines of text with read more */}
          <div className="mt-2 relative">
            <p className="text-gray-700 text-sm font-medium line-clamp-3">{product.description}</p>
            <button
              onClick={() => openProductModal(product)}
              className="mt-2 text-black hover:text-gray-700 text-sm font-medium flex items-center"
            >
              Read more <ChevronRight className="h-3 w-3 ml-1" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Category Filter */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4 text-black">Categories</h2>
        <div className="flex flex-wrap gap-2">
          <Badge
            className={`cursor-pointer ${!activeCategory ? "bg-[#ffd6c0]" : "bg-gray-200 hover:bg-gray-300"}`}
            onClick={() => setActiveCategory(null)}
          >
            All Products
          </Badge>
          {categories.map((category) => (
            <Badge
              key={category.id}
              className={`cursor-pointer ${
                activeCategory === category.name
                  ? getProductCategoryColor(category.name)
                  : "bg-gray-200 hover:bg-gray-300 text-gray-700"
              }`}
              onClick={() => setActiveCategory(category.name)}
            >
              {category.name}
            </Badge>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredProducts.map((product) => renderProduct(product))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={closeProductModal} />
    </>
  )
}
