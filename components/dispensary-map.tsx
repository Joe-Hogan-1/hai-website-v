"use client"

import { useState, useEffect, useRef, useMemo } from "react"
import L from "leaflet"
import "leaflet/dist/leaflet.css"

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

interface DispensaryMapProps {
  dispensaries: Dispensary[]
  loading?: boolean
  selectedLocation?: [number, number] | null
  showOnlyHaiProducts?: boolean
}

export default function DispensaryMap({
  dispensaries,
  loading = false,
  selectedLocation,
  showOnlyHaiProducts = false,
}: DispensaryMapProps) {
  const [isMapLoaded, setIsMapLoaded] = useState(false)
  const [tileProviderIndex, setTileProviderIndex] = useState(0)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const popupsRef = useRef<Record<string, L.Popup>>({})

  // Filter dispensaries based on hai products flag if needed
  const filteredDispensaries = useMemo(() => {
    if (showOnlyHaiProducts) {
      return dispensaries.filter((d) => d.has_hai_products)
    }
    return dispensaries
  }, [dispensaries, showOnlyHaiProducts])

  // New York State bounds and center
  const NY_CENTER: [number, number] = [42.9538, -75.5268] // Center of NY State
  const NY_BOUNDS: L.LatLngBoundsExpression = [
    [40.4774, -79.7624], // Southwest corner
    [45.0153, -71.7517], // Northeast corner
  ]

  // Tile providers for fallback
  const TILE_PROVIDERS = useMemo(
    () => [
      {
        url: "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        name: "Carto Light",
      },
      {
        url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
        name: "Carto Voyager",
      },
      {
        url: "https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png",
        attribution:
          '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
        name: "Stadia Alidade Smooth",
      },
      {
        url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        name: "OpenStreetMap Standard",
      },
    ],
    [],
  )

  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      console.log("Initializing map...")

      // Fix Leaflet icon paths - this is crucial for markers to display correctly
      delete (L.Icon.Default.prototype as any)._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
        iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
        shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
      })

      // Initialize map
      const map = L.map(mapContainerRef.current, {
        center: NY_CENTER,
        zoom: 7,
        zoomControl: false,
        maxBounds: NY_BOUNDS,
        maxBoundsViscosity: 1.0,
        minZoom: 6,
        maxZoom: 18,
        scrollWheelZoom: true,
      })

      // Add zoom control to bottom right
      L.control.zoom({ position: "bottomright" }).addTo(map)

      // Add tile layer
      const currentProvider = TILE_PROVIDERS[tileProviderIndex]
      L.tileLayer(currentProvider.url, {
        attribution: currentProvider.attribution,
        maxZoom: 19,
      }).addTo(map)

      // Store map reference
      mapRef.current = map

      // Handle map events
      map.on("load", () => {
        console.log("Map loaded")
        setIsMapLoaded(true)
      })

      // Set map as loaded after a short delay if the load event doesn't fire
      setTimeout(() => {
        if (!isMapLoaded) {
          console.log("Setting map as loaded via timeout")
          setIsMapLoaded(true)
        }
      }, 1000)

      // Prevent scroll propagation
      mapContainerRef.current.addEventListener("wheel", (e) => {
        e.stopPropagation()
      })
    }

    // Cleanup function
    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [tileProviderIndex, TILE_PROVIDERS, isMapLoaded])

  // Add markers when dispensaries change or map is loaded
  useEffect(() => {
    if (mapRef.current && isMapLoaded && filteredDispensaries.length > 0) {
      console.log("Adding markers for", filteredDispensaries.length, "dispensaries")

      // Clear existing markers that are no longer in the dispensaries list
      Object.keys(markersRef.current).forEach((id) => {
        const stillExists = filteredDispensaries.some((d) => d.id === id)
        if (!stillExists) {
          markersRef.current[id].remove()
          delete markersRef.current[id]
          delete popupsRef.current[id]
        }
      })

      // Create custom icon for dispensaries
      const createHaiIcon = () => {
        try {
          return new L.Icon({
            iconUrl:
              "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png",
            iconSize: [40, 20],
            iconAnchor: [20, 10],
            popupAnchor: [0, -10],
            className: "hai-marker-icon",
          })
        } catch (error) {
          console.error("Failed to create custom icon:", error)
          // Fallback to default icon
          return new L.Icon.Default()
        }
      }

      const haiIcon = createHaiIcon()

      // Add markers for dispensaries
      filteredDispensaries.forEach((dispensary) => {
        try {
          // Validate coordinates
          if (isNaN(dispensary.lat) || isNaN(dispensary.lng)) {
            console.warn(
              `Invalid coordinates for dispensary ${dispensary.name}: [${dispensary.lat}, ${dispensary.lng}]`,
            )
            return
          }

          // Skip if marker already exists
          if (markersRef.current[dispensary.id]) {
            return
          }

          // Create marker
          const marker = L.marker([dispensary.lat, dispensary.lng], { icon: haiIcon })

          // Create popup content with structured information
          const popupContent = document.createElement("div")
          popupContent.className = "dispensary-popup p-3"

          // Create a more structured layout for the popup
          popupContent.innerHTML = `
            <div class="dispensary-card">
              <h3 class="font-bold text-[#ffd6c0] text-lg mb-2">${dispensary.name}</h3>
              
              <div class="dispensary-info mb-3">
                <div class="info-section mb-2">
                  <h4 class="text-xs uppercase font-semibold text-gray-500">Address</h4>
                  <p class="text-sm">${dispensary.address}</p>
                  <p class="text-sm">${dispensary.city}, NY</p>
                </div>
                
                ${
                  dispensary.phone
                    ? `
                <div class="info-section mb-2">
                  <h4 class="text-xs uppercase font-semibold text-gray-500">Phone</h4>
                  <p class="text-sm">
                    <a href="tel:${dispensary.phone}" class="text-[#a8d1e7] hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 mr-1">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                      </svg>
                      ${dispensary.phone}
                    </a>
                  </p>
                </div>
                `
                    : ""
                }
                
                ${
                  dispensary.website
                    ? `
                <div class="info-section mb-2">
                  <h4 class="text-xs uppercase font-semibold text-gray-500">Website</h4>
                  <p class="text-sm">
                    <a href="${dispensary.website}" target="_blank" rel="noopener noreferrer" class="text-[#a8d1e7] hover:underline flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 mr-1">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="2" y1="12" x2="22" y2="12"></line>
                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                      </svg>
                      Visit Website
                    </a>
                  </p>
                </div>
                `
                    : ""
                }
              </div>
              
              ${
                dispensary.image_url
                  ? `
              <div class="mt-3 mb-2">
                <img src="${dispensary.image_url}" alt="${dispensary.name}" class="w-full h-32 object-cover rounded shadow-sm" loading="lazy" onerror="this.onerror=null; this.src='/placeholder.svg?height=150&width=150';">
              </div>
              `
                  : ""
              }
              
              <div class="mt-3 flex items-center text-sm ${dispensary.has_hai_products ? "text-green-600 bg-green-50" : "text-gray-600 bg-gray-50"} p-2 rounded">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" class="h-4 w-4 mr-1">
                  ${
                    dispensary.has_hai_products
                      ? '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle>'
                      : '<circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line>'
                  }
                </svg>
                <span>${dispensary.has_hai_products ? "hai. products available" : "No hai. products available"}</span>
              </div>
            </div>
          `

          // Create popup with custom options
          const popup = L.popup({
            className: "hai-popup",
            maxWidth: 300,
            minWidth: 250,
            closeButton: true,
            autoClose: true,
            closeOnEscapeKey: true,
            autoPan: true,
            autoPanPadding: [50, 50],
            keepInView: true,
            offset: [0, -10],
          }).setContent(popupContent)

          // Bind popup to marker
          marker.bindPopup(popup, {
            offset: [0, -10],
            autoPan: true,
            autoPanPadding: [50, 50],
            keepInView: true,
          })

          // Add marker to map
          marker.addTo(mapRef.current!)

          // Store marker and popup references
          markersRef.current[dispensary.id] = marker
          popupsRef.current[dispensary.id] = popup
        } catch (error) {
          console.error(`Error adding marker for dispensary ${dispensary.name}:`, error)
        }
      })

      // If we have markers, fit the map to show all of them
      if (Object.keys(markersRef.current).length > 0) {
        const markers = Object.values(markersRef.current)
        const group = L.featureGroup(markers)
        mapRef.current.fitBounds(group.getBounds(), {
          padding: [50, 50],
          maxZoom: 12,
        })
      }
    }

    return () => {
      // Close any open popups before cleaning up
      if (mapRef.current) {
        mapRef.current.closePopup()
      }

      // Clear existing markers
      Object.values(markersRef.current).forEach((marker) => {
        if (marker) {
          marker.remove()
        }
      })

      // Reset marker references
      markersRef.current = {}
      popupsRef.current = {}
    }
  }, [filteredDispensaries, isMapLoaded])

  // Handle selected location changes
  useEffect(() => {
    if (mapRef.current && isMapLoaded && selectedLocation) {
      const [lat, lng] = selectedLocation

      // Find the marker closest to the selected location
      let closestMarker: L.Marker | null = null
      let closestDistance = Number.POSITIVE_INFINITY
      let closestId = ""

      Object.entries(markersRef.current).forEach(([id, marker]) => {
        const markerLatLng = marker.getLatLng()
        const distance = Math.sqrt(Math.pow(markerLatLng.lat - lat, 2) + Math.pow(markerLatLng.lng - lng, 2))

        if (distance < closestDistance) {
          closestDistance = distance
          closestMarker = marker
          closestId = id
        }
      })

      if (closestMarker) {
        // Zoom to the marker
        mapRef.current.setView(closestMarker.getLatLng(), 15, {
          animate: true,
          duration: 1,
        })

        // Open the popup after a short delay to ensure the map has finished moving
        setTimeout(() => {
          closestMarker?.openPopup()
        }, 500)
      }
    }
  }, [selectedLocation, isMapLoaded])

  // Handle tile provider change
  useEffect(() => {
    if (mapRef.current) {
      // Remove existing tile layers
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.TileLayer) {
          mapRef.current?.removeLayer(layer)
        }
      })

      // Add new tile layer
      const currentProvider = TILE_PROVIDERS[tileProviderIndex]
      L.tileLayer(currentProvider.url, {
        attribution: currentProvider.attribution,
        maxZoom: 19,
      }).addTo(mapRef.current)
    }
  }, [tileProviderIndex, TILE_PROVIDERS])

  return (
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden map-wrapper">
      {(!isMapLoaded || loading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-[1000]">
          <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
        </div>
      )}

      <div ref={mapContainerRef} className="h-full w-full map-container" />

      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-2 rounded shadow text-xs">
        <p>Data provided by hai. Locations may change. Please call ahead to confirm availability.</p>
      </div>

      <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded shadow">
        <div className="text-xs font-medium mb-1">Map Style:</div>
        <select
          className="text-xs p-1 border rounded w-full"
          value={tileProviderIndex}
          onChange={(e) => setTileProviderIndex(Number(e.target.value))}
        >
          {TILE_PROVIDERS.map((provider, index) => (
            <option key={provider.name} value={index}>
              {provider.name}
            </option>
          ))}
        </select>
      </div>

      {filteredDispensaries.length === 0 && !loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-[999]">
          <div className="text-center p-4 bg-white rounded-lg shadow-lg">
            <p className="text-xl font-bold text-gray-700 mb-2">No Dispensaries Found</p>
            <p className="text-gray-600">We couldn't find any dispensary locations to display.</p>
          </div>
        </div>
      )}
    </div>
  )
}
