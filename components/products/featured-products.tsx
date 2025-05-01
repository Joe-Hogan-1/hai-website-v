"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useTilt } from "@/hooks/use-tilt"
import { ChevronRight } from "lucide-react"
import ProductDetailModal from "./product-detail-modal"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  featured: boolean
  category?: "Indica" | "Sativa" | "Hybrid" | null
  product_category?: string | null
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { handleMouseMove, handleMouseEnter, handleMouseLeave, tiltRef } = useTilt()
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    async function fetchFeaturedProducts() {
      try {
        const { data, error } = await supabase
          .from("products")
          .select("*")
          .eq("featured", true)
          .order("created_at", { ascending: false })
          .limit(3)

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        // Silent error handling
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
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

  if (products.length === 0) {
    return null
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            ref={tiltRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className="bg-white/90 backdrop-blur-sm rounded-lg overflow-hidden transform-gpu transition-all duration-300 shadow-lg product-card border border-white/50"
            style={{
              transformStyle: "preserve-3d",
              boxShadow: "0 15px 35px rgba(0, 0, 0, 0.15), 0 5px 15px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div className="h-48 overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg?height=200&width=300"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                style={{ transform: "translateZ(20px)" }}
              />
            </div>
            <div className="p-4" style={{ transform: "translateZ(30px)" }}>
              {/* First line: Product name */}
              <h2 className="text-xl font-semibold text-[#0e7490] line-clamp-1">{product.name}</h2>

              {/* Second line: Short description (first sentence) */}
              <p className="text-gray-700 text-sm mt-1 font-medium line-clamp-1">
                {product.description.split(".")[0]}.
              </p>

              {/* Third line: Area for 3 lines of text with read more */}
              <div className="mt-2 relative">
                <p className="text-gray-700 text-sm font-medium line-clamp-3">{product.description}</p>
                <button
                  onClick={() => openProductModal(product)}
                  className="mt-2 text-[#e76f51] hover:text-[#e76f51]/80 text-sm font-medium flex items-center"
                >
                  Read more <ChevronRight className="h-3 w-3 ml-1" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Product Detail Modal */}
      <ProductDetailModal product={selectedProduct} isOpen={isModalOpen} onClose={closeProductModal} />
    </>
  )
}
