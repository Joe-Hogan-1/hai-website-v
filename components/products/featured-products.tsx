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
  featured: boolean
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const { handleMouseMove, handleMouseEnter, handleMouseLeave, tiltRef } = useTilt()

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
        console.error("Error fetching featured products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedProducts()
  }, [])

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
            <h2 className="text-xl font-semibold mb-1 text-[#0e7490]">{product.name}</h2>
            <p className="text-[#e76f51] font-bold mb-2">${product.price.toFixed(2)}</p>
            <p className="text-gray-700 text-sm mb-4 font-medium">{product.description}</p>
          </div>
        </div>
      ))}
    </div>
  )
}
