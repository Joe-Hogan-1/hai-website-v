"use client"

import { useEffect, useState } from "react"
import { useMap } from "react-leaflet"
import L from "leaflet"
import { getNYCStreets, type StreetFeature } from "@/utils/geo-data"

const ZOOM_STREET_VISIBILITY: { [key: number]: string[] } = {
  11: ["primary"],
  12: ["primary", "secondary"],
  13: ["primary", "secondary", "tertiary"],
  14: ["primary", "secondary", "tertiary", "residential"],
}

export default function HolographicStreets() {
  const map = useMap()
  const [streetLayer, setStreetLayer] = useState<L.GeoJSON | null>(null)

  useEffect(() => {
    let isMounted = true

    const fetchAndRenderStreets = async () => {
      try {
        const streets = await getNYCStreets()
        if (!isMounted) return

        const layer = L.geoJSON(streets, {
          style: (feature) => ({
            color: getStreetColor(feature),
            weight: getStreetWeight(feature),
            opacity: 0.6,
            className: "holographic-street",
          }),
          filter: (feature) => shouldRenderStreet(feature, map.getZoom()),
        }).addTo(map)

        setStreetLayer(layer)
      } catch (error) {
        // Error handling for streets rendering
      }
    }

    fetchAndRenderStreets()

    return () => {
      isMounted = false
      if (streetLayer) {
        map.removeLayer(streetLayer)
      }
    }
  }, [map, streetLayer]) // Added streetLayer to dependencies

  useEffect(() => {
    if (!streetLayer) return

    const updateStreetVisibility = () => {
      streetLayer.eachLayer((layer: L.Path) => {
        const feature = layer.feature as StreetFeature
        const shouldRender = shouldRenderStreet(feature, map.getZoom())
        layer.setStyle({ opacity: shouldRender ? 0.6 : 0 })
      })
    }

    map.on("zoomend", updateStreetVisibility)

    return () => {
      map.off("zoomend", updateStreetVisibility)
    }
  }, [map, streetLayer])

  return null
}

function getStreetColor(feature: StreetFeature): string {
  switch (feature.properties.type) {
    case "primary":
      return "#00ffff"
    case "secondary":
      return "#00ccff"
    case "tertiary":
      return "#0099ff"
    default:
      return "#0066ff"
  }
}

function getStreetWeight(feature: StreetFeature): number {
  switch (feature.properties.type) {
    case "primary":
      return 4
    case "secondary":
      return 3
    case "tertiary":
      return 2
    default:
      return 1
  }
}

function shouldRenderStreet(feature: StreetFeature, zoom: number): boolean {
  const visibleTypes = ZOOM_STREET_VISIBILITY[Math.floor(zoom)] || []
  return visibleTypes.includes(feature.properties.type)
}
