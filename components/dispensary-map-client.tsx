"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import dynamic from "next/dynamic"
import DispensaryList from "@/components/dispensary-list"

// Dynamically import the map component with no SSR
const DispensaryMap = dynamic(() => import("@/components/dispensary-map"), {
  ssr: false,
  loading: () => (
    <div className="h-[600px] w-full flex items-center justify-center bg-gray-100 rounded-lg">
      <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
    </div>
  ),
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

export default function DispensaryMapClient() {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null)
  const [showOnlyHaiProducts, setShowOnlyHaiProducts] = useState(false)

  // Use useCallback for the fetch function to prevent recreating it on each render
  const fetchDispensaries = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      // Try to fetch from Supabase
      const { data, error } = await supabase.from("dispensaries").select("*").order("name")

      if (error) {
        // If the table doesn't exist, use fallback data
        if (error.message.includes("does not exist")) {
          const fallbackData = getFallbackDispensaryData()
          setDispensaries(fallbackData)
        } else {
          setError(`Failed to load dispensary locations: ${error.message}`)
          setDispensaries(getFallbackDispensaryData())
        }
      } else {
        if (data && data.length > 0) {
          setDispensaries(data)
        } else {
          const fallbackData = getFallbackDispensaryData()
          setDispensaries(fallbackData)
        }
      }
    } catch (error) {
      setError("An unexpected error occurred while loading dispensary data")

      // Always use fallback data on error
      const fallbackData = getFallbackDispensaryData()
      setDispensaries(fallbackData)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchDispensaries()
  }, [fetchDispensaries])

  // Function to handle selecting a dispensary from the list
  const handleSelectDispensary = (lat: number, lng: number) => {
    // Only update if the coordinates are different to prevent unnecessary re-renders
    setSelectedLocation((prev) => {
      if (!prev || prev[0] !== lat || prev[1] !== lng) {
        return [lat, lng]
      }
      return prev
    })
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
        <DispensaryMap
          dispensaries={dispensaries}
          loading={loading}
          selectedLocation={selectedLocation}
          showOnlyHaiProducts={showOnlyHaiProducts}
        />
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

        <DispensaryList
          dispensaries={dispensaries}
          onSelectDispensary={handleSelectDispensary}
          loading={loading}
          onFilterChange={handleFilterChange}
          compact={true}
        />
      </div>
    </div>
  )
}
