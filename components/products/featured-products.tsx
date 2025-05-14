"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { ChevronRight } from "lucide-react"
import Link from "next/link"

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
          <Link
            key={product.id}
            href={`/products/${product.id}`}
            className="block bg-white rounded-lg overflow-hidden transition-all duration-300 shadow-lg product-card border border-gray-200"
          >
            <div className="h-48 overflow-hidden">
              <img
                src={product.image_url || "/placeholder.svg?height=200&width=300"}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            <div className="p-4">
              {/* First line: Product name */}
              <h2 className="text-xl font-semibold text-black line-clamp-1">{product.name}</h2>

              {/* Second line: Short description (first sentence) */}
              <p className="text-gray-700 text-sm mt-1 font-medium line-clamp-1">
                {product.description.split(".")[0]}.
              </p>

              {/* Third line: Area for 3 lines of text with read more */}
              <div className="mt-2 relative">
                <p className="text-gray-700 text-sm font-medium line-clamp-3">{product.description}</p>
                <div className="mt-2 text-white bg-black hover:bg-gray-700 text-sm font-medium flex items-center px-3 py-1 rounded w-fit">
                  Read more <ChevronRight className="h-3 w-3 ml-1" />
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
