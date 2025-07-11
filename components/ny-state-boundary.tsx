"use client"

import { useEffect } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"

// GeoJSON for New York State boundary (simplified)
const nyStateBoundary = {
  type: "Feature",
  properties: {
    name: "New York",
  },
  geometry: {
    type: "Polygon",
    coordinates: [
      [
        [-79.7624, 42.2691],
        [-79.0612, 42.1798],
        [-78.9287, 42.08],
        [-78.9287, 42.0003],
        [-78.9287, 41.9983],
        [-78.9287, 41.9983],
        [-79.0612, 41.9983],
        [-79.0612, 41.9983],
        [-79.0612, 41.9983],
        [-79.7624, 41.9983],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
        [-79.7624, 42.2691],
      ],
    ],
  },
}

export default function NYStateBoundary() {
  const map = useMap()

  useEffect(() => {
    // Add NY state boundary to the map
    const boundaryLayer = L.geoJSON(nyStateBoundary as any, {
      style: {
        color: "#ffd6c0",
        weight: 3,
        opacity: 0.7,
        fillColor: "#ffd6c0",
        fillOpacity: 0.05,
      },
    }).addTo(map)

    return () => {
      map.removeLayer(boundaryLayer)
    }
  }, [map])

  return null
}
