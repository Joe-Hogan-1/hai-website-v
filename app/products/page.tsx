import Header from "@/components/header"
import ProductGrid from "@/components/products/product-grid"

// Add more padding at the top of the page
export default function ProductsPage() {
  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto px-4 py-6 pt-8">
          <h1 className="text-4xl font-bold mb-4 text-center">Our Products</h1>
          <ProductGrid />
        </div>
      </div>
    </>
  )
}

function ProductLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
        <div key={item} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
          <div className="h-48 bg-gray-200"></div>
          <div className="p-4">
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  )
}
