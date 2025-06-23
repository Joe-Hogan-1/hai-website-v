"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  category?: "Indica" | "Sativa" | "Hybrid" | null
  product_category?: string | null
}

interface ProductDetailModalProps {
  product: Product | null
  isOpen: boolean
  onClose: () => void
}

export default function ProductDetailModal({ product, isOpen, onClose }: ProductDetailModalProps) {
  if (!product) return null

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

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()} style={{ zIndex: 200 }}>
      <DialogContent
        className="sm:max-w-[800px] p-0 overflow-hidden z-[200] max-h-[90vh] bg-white"
        hideCloseButton={true}
        style={{
          zIndex: 200,
          position: "fixed",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          backgroundColor: "white",
        }}
      >
        <DialogHeader className="p-6 pb-0 bg-white">
          <div className="flex justify-between items-start">
            <DialogTitle className="text-2xl font-bold text-left">{product.name}</DialogTitle>
          </div>
          <DialogDescription className="sr-only">Product details for {product.name}</DialogDescription>
        </DialogHeader>
        <div className="p-6 pt-8 overflow-y-auto max-h-[calc(80vh-120px)] bg-white">
          <div className="relative h-96 mb-6 rounded-lg overflow-hidden">
            <img
              src={product.image_url || "/placeholder.svg?height=400&width=600"}
              alt={product.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-2 left-2 flex flex-col gap-1">
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

          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-left">Description</h3>
              <p className="text-gray-700 whitespace-pre-line text-left">{product.description}</p>
            </div>

            <div className="pt-4 pb-2 border-t border-gray-200">
              <button
                onClick={onClose}
                className="w-full py-2 px-4 bg-black hover:bg-gray-800 text-white rounded-md transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
