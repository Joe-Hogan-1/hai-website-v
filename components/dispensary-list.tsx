"use client"

import type React from "react"

import { useState } from "react"
import { Search } from "lucide-react"

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

interface DispensaryListProps {
  dispensaries: Dispensary[]
  onSelectDispensary: (lat: number, lng: number) => void
  loading: boolean
  onFilterChange?: (showOnly: boolean) => void
  compact?: boolean
}

export default function DispensaryList({
  dispensaries,
  onSelectDispensary,
  loading,
  onFilterChange,
  compact = false,
}: DispensaryListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [showOnlyHaiProducts, setShowOnlyHaiProducts] = useState(false)

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked
    setShowOnlyHaiProducts(checked)
    if (onFilterChange) {
      onFilterChange(checked)
    }
  }

  const filteredDispensaries = dispensaries.filter((dispensary) => {
    const matchesSearch =
      dispensary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispensary.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispensary.city.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = showOnlyHaiProducts ? dispensary.has_hai_products : true

    return matchesSearch && matchesFilter
  })

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-lg p-6 h-full">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-10 bg-gray-200 rounded mb-6"></div>
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className={compact ? "" : "bg-white rounded-lg shadow-lg p-6 h-full"}>
      {!compact && (
        <>
          <h2 className="text-2xl font-semibold mb-4 text-[#a8d1e7]">Dispensary Locations</h2>
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                <Search className="w-4 h-4 text-gray-500" />
              </div>
              <input
                type="search"
                className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Search by name, address, or city..."
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
          </div>

          {onFilterChange && (
            <div className="flex items-center mb-4">
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={showOnlyHaiProducts}
                  onChange={handleFilterChange}
                />
                <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0e7490]"></div>
                <span className="ms-3 text-sm font-medium text-gray-900">Show only hai. products</span>
              </label>
            </div>
          )}
        </>
      )}

      {compact && (
        <div className="relative mb-6">
          <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
            <Search className="w-4 h-4 text-gray-500" />
          </div>
          <input
            type="search"
            className="block w-full p-2.5 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Search by name, address, or city..."
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      )}

      {filteredDispensaries.length === 0 ? (
        <div className="text-center py-4">
          <p className="text-gray-500">No dispensaries found matching your criteria.</p>
        </div>
      ) : (
        <div
          className={
            compact
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
              : "space-y-4 overflow-auto max-h-[500px] pr-2"
          }
        >
          {filteredDispensaries.map((dispensary) => (
            <div
              key={dispensary.id}
              className={`${
                compact ? "p-3" : "p-4"
              } bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                dispensary.has_hai_products ? "border-l-4 border-l-[#ffd6c0]" : ""
              }`}
              onClick={() => onSelectDispensary(dispensary.lat, dispensary.lng)}
            >
              <div className="flex items-start gap-3">
                {dispensary.image_url && !compact && (
                  <img
                    src={dispensary.image_url || "/placeholder.svg"}
                    alt={dispensary.name}
                    className="w-16 h-16 object-cover rounded-md"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <h3 className={`${compact ? "text-base" : "text-lg"} font-semibold text-[#0e7490] truncate`}>
                    {dispensary.name}
                  </h3>
                  <p className={`${compact ? "text-xs" : "text-sm"} text-gray-600 truncate`}>
                    {dispensary.address}, {dispensary.city}
                  </p>
                  {dispensary.phone && !compact && <p className="text-sm text-gray-500">{dispensary.phone}</p>}
                  {dispensary.has_hai_products && (
                    <span className="inline-flex items-center px-2 py-1 mt-1 text-xs font-medium rounded-full bg-[#ffd6c0]/20 text-[#e76f51]">
                      hai. products available
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
