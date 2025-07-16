import type React from "react"
import Image from "next/image"

const products = [
  { id: 1, name: "Product 1", image: "/placeholder.svg?height=200&width=200" },
  { id: 2, name: "Product 2", image: "/placeholder.svg?height=200&width=200" },
  { id: 3, name: "Product 3", image: "/placeholder.svg?height=200&width=200" },
  // Add more products as needed
]

const ProductGrid: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {products.map((product) => (
        <div key={product.id} className="bg-white p-4 shadow">
          <Image
            src={product.image || "/placeholder.svg"}
            alt={product.name}
            width={200}
            height={200}
            className="w-full h-50"
          />
          <h2 className="mt-2 text-lg font-semibold">{product.name}</h2>
        </div>
      ))}
    </div>
  )
}

export default ProductGrid
