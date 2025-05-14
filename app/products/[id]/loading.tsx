export default function ProductDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 sm:p-6 md:p-8">
          <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-6"></div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Product Image Skeleton */}
            <div className="aspect-square rounded-lg bg-gray-200 animate-pulse"></div>

            {/* Product Details Skeleton */}
            <div>
              <div className="h-8 bg-gray-200 rounded w-3/4 animate-pulse mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
