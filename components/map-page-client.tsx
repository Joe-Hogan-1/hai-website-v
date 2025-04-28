"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import dynamic from "next/dynamic"
import { supabase } from "@/utils/supabase"
import DispensaryList from "@/components/dispensary-list"

// Dynamically import the map component with no SSR
const DispensaryMap = dynamic(() => import("@/components/dispensary-map"), {
  ssr: false,
  loading: () => <MapLoadingSkeleton />,
})

// Define the Dispensary type
interface Dispensary {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  phone?: string
  website?: string
  image_url?: string
  has_hai_products: boolean
}

function MapLoadingSkeleton() {
  return (
    <div className="h-[600px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg animate-pulse">
      <div className="w-16 h-16 border-4 border-[#ffd6c0] border-t-transparent rounded-full animate-spin mb-4"></div>
      <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
      <p className="text-gray-500 mt-2">Please wait while we load the dispensary locations...</p>
    </div>
  )
}

function ListLoadingSkeleton() {
  return (
    <div className="h-[200px] bg-gray-100 rounded-lg animate-pulse flex items-center justify-center">
      <p className="text-gray-500">Loading dispensary list...</p>
    </div>
  )
}

export default function MapPageClient() {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [showOnlyHaiProducts, setShowOnlyHaiProducts] = useState(false)

  // Use useCallback to prevent unnecessary re-renders
  const fetchDispensaries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      console.log("Fetching dispensary data...")

      // Try to fetch from Supabase
      const { data, error } = await supabase.from("dispensaries").select("*").order("name")

      if (error) {
        console.error("Supabase error:", error)
        // If the table doesn't exist, use fallback data
        if (error.message.includes("does not exist")) {
          console.log("Using fallback dispensary data")
          const fallbackData = getFallbackDispensaryData()
          setDispensaries(fallbackData)
          console.log("Fallback data loaded:", fallbackData.length, "dispensaries")
        } else {
          setError(`Failed to load dispensary locations: ${error.message}`)
          setDispensaries([])
        }
      } else {
        if (data && data.length > 0) {
          console.log("Loaded", data.length, "dispensaries from Supabase")
          setDispensaries(data)
        } else {
          console.log("No dispensaries found in Supabase, using fallback data")
          const fallbackData = getFallbackDispensaryData()
          setDispensaries(fallbackData)
          console.log("Fallback data loaded:", fallbackData.length, "dispensaries")
        }
      }
    } catch (error) {
      console.error("Error fetching dispensaries:", error)
      setError("An unexpected error occurred while loading dispensary data")

      // Always use fallback data on error
      const fallbackData = getFallbackDispensaryData()
      setDispensaries(fallbackData)
      console.log("Fallback data loaded after error:", fallbackData.length, "dispensaries")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDispensaries()
  }, [fetchDispensaries])

  // Function to handle selecting a dispensary from the list
  const handleSelectDispensary = (lat: number, lng: number) => {
    console.log("Selected location:", lat, lng)
    setSelectedLocation([lat, lng])
  }

  // Handle filter change
  const handleFilterChange = (showOnly: boolean) => {
    setShowOnlyHaiProducts(showOnly)
  }

  // Add this function to provide fallback data
  function getFallbackDispensaryData(): Dispensary[] {
    return [
      {
        id: "1",
        name: "Manhattan Dispensary",
        address: "123 Broadway",
        city: "New York",
        lat: 40.7128,
        lng: -74.006,
        phone: "212-555-1234",
        website: "https://example.com",
        image_url: "/placeholder.svg?height=150&width=150",
        has_hai_products: true,
      },
      {
        id: "2",
        name: "Brooklyn Heights Cannabis",
        address: "456 Atlantic Ave",
        city: "Brooklyn",
        lat: 40.6782,
        lng: -73.9442,
        phone: "718-555-5678",
        image_url: "/placeholder.svg?height=150&width=150",
        has_hai_products: true,
      },
      {
        id: "3",
        name: "Buffalo Dispensary",
        address: "789 Main St",
        city: "Buffalo",
        lat: 42.8864,
        lng: -78.8784,
        website: "https://example.com/buffalo",
        image_url: "/placeholder.svg?height=150&width=150",
        has_hai_products: false,
      },
      {
        id: "4",
        name: "Albany Cannabis Co",
        address: "101 State St",
        city: "Albany",
        lat: 42.6526,
        lng: -73.7562,
        phone: "518-555-9012",
        image_url: "/placeholder.svg?height=150&width=150",
        has_hai_products: true,
      },
      {
        id: "5",
        name: "Rochester Wellness",
        address: "202 Park Ave",
        city: "Rochester",
        lat: 43.1566,
        lng: -77.6088,
        phone: "585-555-3456",
        website: "https://example.com/rochester",
        image_url: "/placeholder.svg?height=150&width=150",
        has_hai_products: false,
      },
    ]
  }

  return (
    <div className="flex flex-col gap-6">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
          <p className="font-medium">Error loading dispensary data</p>
          <p className="text-sm">{error}</p>
        </div>
      )}

      <div className="bg-white rounded-lg shadow-lg p-6 map-container-wrapper w-full">
        <Suspense fallback={<MapLoadingSkeleton />}>
          <DispensaryMap
            dispensaries={dispensaries}
            loading={loading}
            selectedLocation={selectedLocation}
            showOnlyHaiProducts={showOnlyHaiProducts}
          />
        </Suspense>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-[#a8d1e7]">Dispensary Locations</h2>
          <div className="flex items-center">
            <label className="inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={showOnlyHaiProducts}
                onChange={(e) => handleFilterChange(e.target.checked)}
              />
              <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e7490]"></div>
              <span className="ms-3 text-sm font-medium text-gray-900">Show only hai. products</span>
            </label>
          </div>
        </div>

        <Suspense fallback={<ListLoadingSkeleton />}>
          <DispensaryList
            dispensaries={dispensaries}
            onSelectDispensary={handleSelectDispensary}
            loading={loading}
            onFilterChange={handleFilterChange}
            compact={true}
          />
        </Suspense>
      </div>
    </div>
  )
}
