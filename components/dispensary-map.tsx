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
  const tileProviderIndex = 0 // Always use Carto Light (index 0)
  const mapRef = useRef<L.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, L.Marker>>({})
  const popupsRef = useRef<Record<string, L.Popup>>({})
  const [prevSelectedLocation, setPrevSelectedLocation] = useState<[number, number] | null>(null)

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

  // Create custom icons for markers
  const createHaiIcon = () => {
    return L.divIcon({
      html: `
        <div style="background-color: #ffd6c0; width: 24px; height: 24px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          <span style="color: white; font-weight: bold; font-size: 10px;">hai</span>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [30, 30],
      iconAnchor: [15, 15],
      popupAnchor: [0, -15],
    })
  }

  const createStandardIcon = () => {
    return L.divIcon({
      html: `
        <div style="background-color: #a8d1e7; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; display: flex; align-items: center; justify-content: center; box-shadow: 0 2px 5px rgba(0,0,0,0.3);">
          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
            <circle cx="12" cy="10" r="3"></circle>
          </svg>
        </div>
      `,
      className: "custom-div-icon",
      iconSize: [24, 24],
      iconAnchor: [12, 12],
      popupAnchor: [0, -12],
    })
  }

  // Initialize map when component mounts
  useEffect(() => {
    if (mapContainerRef.current && !mapRef.current) {
      try {
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
          setIsMapLoaded(true)
        })

        // Set map as loaded after a short delay if the load event doesn't fire
        setTimeout(() => {
          if (!isMapLoaded) {
            setIsMapLoaded(true)
          }
        }, 1000)

        // Prevent scroll propagation
        mapContainerRef.current.addEventListener("wheel", (e) => {
          e.stopPropagation()
        })
      } catch (error) {
        console.error("Error initializing map:", error)
      }
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
      try {
        // Clear existing markers that are no longer in the dispensaries list
        Object.keys(markersRef.current).forEach((id) => {
          const stillExists = filteredDispensaries.some((d) => d.id === id)
          if (!stillExists) {
            markersRef.current[id].remove()
            delete markersRef.current[id]
            delete popupsRef.current[id]
          }
        })

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

            // Create marker with appropriate icon
            const marker = L.marker([dispensary.lat, dispensary.lng], {
              icon: dispensary.has_hai_products ? createHaiIcon() : createStandardIcon(),
              riseOnHover: true,
              riseOffset: 250,
            })

            // Create popup content with structured information
            const popupContent = document.createElement("div")
            popupContent.className = "dispensary-popup"
            popupContent.innerHTML = `
              <div style="padding: 0; background-color: white; color: #333; border-radius: 8px; overflow: hidden;">
                <h3 style="font-size: 18px; font-weight: 600; margin: 0; padding: 15px 15px 10px; color: black; border-bottom: 1px solid #f0f0f0;">${dispensary.name}</h3>
                
                <div style="padding: 10px 15px;">
                  <div style="margin-bottom: 12px;">
                    <h4 style="font-size: 12px; text-transform: uppercase; font-weight: 600; margin: 0 0 4px; color: #666;">Address</h4>
                    <p style="font-size: 14px; margin: 0 0 4px; color: black;">${dispensary.address}</p>
                    <p style="font-size: 14px; margin: 0 0 4px; color: black;">${dispensary.city}, NY</p>
                  </div>
                  
                  ${
                    dispensary.phone
                      ? `
                  <div style="margin-bottom: 12px;">
                    <h4 style="font-size: 12px; text-transform: uppercase; font-weight: 600; margin: 0 0 4px; color: #666;">Phone</h4>
                    <p style="font-size: 14px; margin: 0 0 4px; color: black;">
                      <a href="tel:${dispensary.phone}" style="color: black; text-decoration: none;">
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
                  <div style="margin-bottom: 12px;">
                    <h4 style="font-size: 12px; text-transform: uppercase; font-weight: 600; margin: 0 0 4px; color: #666;">Website</h4>
                    <p style="font-size: 14px; margin: 0 0 4px; color: black;">
                      <a href="${dispensary.website}" target="_blank" rel="noopener noreferrer" style="color: black; text-decoration: none;">
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
              <div style="width: 100%; height: 150px; overflow: hidden; border-top: 1px solid #f0f0f0; border-bottom: 1px solid #f0f0f0;">
                <img src="${dispensary.image_url}" alt="${dispensary.name}" style="width: 100%; height: 100%; object-fit: cover;" loading="lazy" onerror="this.onerror=null; this.src='/placeholder.svg?height=150&width=150';">
              </div>
              `
                    : ""
                }
                
                <div style="display: flex; align-items: center; padding: 10px 15px; font-size: 14px; font-weight: 500; ${
                  dispensary.has_hai_products
                    ? "background-color: rgba(255, 214, 192, 0.2); color: #e76f51;"
                    : "background-color: #f5f5f5; color: #666;"
                }">
                  <span>${dispensary.has_hai_products ? "hai. products available" : "No hai. products available"}</span>
                </div>
              </div>
            `

            // Create popup with custom options
            const popup = L.popup({
              maxWidth: 300,
              minWidth: 250,
              closeButton: true,
              autoClose: true,
              closeOnEscapeKey: true,
              autoPan: true,
              autoPanPadding: [50, 50],
              keepInView: true,
              className: "dispensary-popup-container",
            }).setContent(popupContent)

            // Bind popup to marker
            marker.bindPopup(popup)

            // Add marker to map
            marker.addTo(mapRef.current!)

            // Store marker and popup references
            markersRef.current[dispensary.id] = marker
            popupsRef.current[dispensary.id] = popup
          } catch (error) {
            console.error("Error adding marker:", error)
          }
        })

        // If we have markers, fit the map to show all of them
        // Only do this once when markers are first added
        if (Object.keys(markersRef.current).length > 0 && !mapRef.current._loaded) {
          try {
            const markers = Object.values(markersRef.current)
            const group = L.featureGroup(markers)
            const bounds = group.getBounds()

            // Check if bounds are valid before fitting
            if (bounds.isValid()) {
              mapRef.current.fitBounds(bounds, {
                padding: [50, 50],
                maxZoom: 12,
                animate: false,
              })
            }
          } catch (error) {
            console.error("Error fitting bounds:", error)
          }
        }
      } catch (error) {
        console.error("Error in marker management:", error)
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
    // Skip if no map, not loaded, or no selected location
    if (!mapRef.current || !isMapLoaded || !selectedLocation) return

    // Skip if the selected location is the same as the previous one
    if (
      prevSelectedLocation &&
      prevSelectedLocation[0] === selectedLocation[0] &&
      prevSelectedLocation[1] === selectedLocation[1]
    ) {
      return
    }

    // Update previous selected location
    setPrevSelectedLocation(selectedLocation)

    try {
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
        // Get the marker's position
        const position = closestMarker.getLatLng()

        // Use flyTo instead of setView for smoother animation and to avoid recursion
        mapRef.current.flyTo(position, 15, {
          animate: true,
          duration: 1,
        })

        // Open the popup after the animation completes
        setTimeout(() => {
          if (closestMarker && mapRef.current) {
            closestMarker.openPopup()
          }
        }, 1000)
      }
    } catch (error) {
      console.error("Error handling selected location:", error)
    }
  }, [selectedLocation, isMapLoaded, prevSelectedLocation])

  // Handle tile provider change
  useEffect(() => {
    if (mapRef.current) {
      try {
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
      } catch (error) {
        console.error("Error changing tile provider:", error)
      }
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
