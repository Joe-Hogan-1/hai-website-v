"use client"

import { useState, useEffect, useCallback } from "react"
import { supabase } from "@/utils/supabase"
import DispensaryMap from "@/components/dispensary-map"
import DispensaryList from "@/components/dispensary-list"

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
  const [mapRef, setMapRef] = useState<any>(null)

  // Use useCallback for the fetch function to prevent recreating it on each render
  const fetchDispensaries = useCallback(async () => {
    try {
      setLoading(true)

      // Try to fetch from Supabase
      const { data, error } = await supabase.from("dispensaries").select("*").eq("has_hai_products", true).order("name")

      if (error) {
        // If the table doesn't exist, use fallback data
        if (error.message.includes("does not exist")) {
          setDispensaries(getFallbackDispensaryData())
        } else {
          console.error("Failed to load dispensary locations:", error)
          setDispensaries(getFallbackDispensaryData())
        }
      } else {
        setDispensaries(data && data.length > 0 ? data : getFallbackDispensaryData())
      }
    } catch (error) {
      console.error("Error fetching dispensaries:", error)
      setDispensaries(getFallbackDispensaryData())
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    // Only fetch once when the component mounts
    let isMounted = true

    if (isMounted) {
      fetchDispensaries()
    }

    return () => {
      isMounted = false
    }
  }, [fetchDispensaries])

  // Function to handle selecting a dispensary from the list
  const handleSelectDispensary = (lat: number, lng: number) => {
    if (mapRef) {
      mapRef.setView([lat, lng], 15)
    }
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
        has_hai_products: true,
      },
      {
        id: "4",
        name: "Albany Cannabis Co",
        address: "101 State St",
        city: "Albany",
        lat: 42.6526,
        lng: -73.7562,
        phone: "518-555-9012",
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
        has_hai_products: true,
      },
    ]
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <div className="lg:col-span-2">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <DispensaryMap dispensaries={dispensaries} loading={loading} />
        </div>
      </div>

      <div>
        <DispensaryList dispensaries={dispensaries} onSelectDispensary={handleSelectDispensary} loading={loading} />
      </div>
    </div>
  )
}
