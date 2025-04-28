"use client"

import dynamic from "next/dynamic"
import { useState, useEffect } from "react"

const MapIframe = dynamic(() => import("./map-iframe"), {
  loading: () => <p>Loading map...</p>,
  ssr: false,
})

export default function StoreLocatorClient() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  return (
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden">
      {isClient && <MapIframe />}
      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-2 rounded shadow text-sm">
        <p>Data provided by New York State Office of Cannabis Management</p>
      </div>
    </div>
  )
}
