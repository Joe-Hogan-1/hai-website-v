"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { useTilt } from "@/hooks/use-tilt"

interface Product {
  id: string
  name: string
  description: string
  price: number
  image_url: string
  category?: "Indica" | "Sativa" | "Hybrid" | null
}

export default function ProductGrid() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { handleMouseMove, handleMouseEnter, handleMouseLeave, tiltRef } = useTilt()

  useEffect(() => {
    async function fetchProducts() {
      try {
        const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

        if (error) throw error
        setProducts(data || [])
      } catch (error) {
        // Error fetching products
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <p className="text-xl text-gray-600">No products available yet.</p>
        <p className="text-gray-500 mt-2">Check back soon for our product lineup!</p>
      </div>
    )
  }

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

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <div
          key={product.id}
          ref={tiltRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className="bg-white rounded-lg shadow-md overflow-hidden transform-gpu transition-all duration-300 hover:shadow-xl product-card border border-white/30 relative"
          style={{ transformStyle: "preserve-3d", boxShadow: "0 10px 30px rgba(0, 0, 0, 0.1)" }}
        >
          <div className="h-48 overflow-hidden relative">
            <img
              src={product.image_url || "/placeholder.svg?height=200&width=300"}
              alt={product.name}
              className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              style={{ transform: "translateZ(20px)" }}
            />
            {product.category && (
              <div
                className={`absolute top-2 right-2 px-3 py-1 rounded-full text-xs font-bold ${getCategoryColor(
                  product.category,
                )}`}
                style={{ transform: "translateZ(40px)" }}
              >
                {product.category}
              </div>
            )}
          </div>
          <div className="p-4" style={{ transform: "translateZ(30px)" }}>
            <h2 className="text-xl font-semibold mb-1 text-[#0e7490]">{product.name}</h2>
            <p className="text-[#e76f51] font-bold mb-2">${product.price.toFixed(2)}</p>
            <p className="text-gray-600 text-sm mb-4 font-medium">{product.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
