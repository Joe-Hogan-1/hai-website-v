import Link from "next/link"

export default function ProductNotFound() {
  return (
    <div className="container mx-auto px-4 py-16 text-center">
      <h1 className="text-4xl font-bold text-black mb-4">Product Not Found</h1>
      <p className="text-gray-700 mb-8">The product you're looking for doesn't exist or has been removed.</p>
      <Link
        href="/products"
        className="inline-block bg-black text-white px-6 py-3 rounded-md hover:bg-gray-800 transition-colors"
      >
        Browse All Products
      </Link>
    </div>
  )
}
