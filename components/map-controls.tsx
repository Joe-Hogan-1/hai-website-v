"use client"

import { useState } from "react"

export function MapControls() {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="absolute top-4 right-4 z-[1000]">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="bg-white p-2 rounded shadow button-hover"
        aria-expanded={isExpanded}
        aria-label="Toggle map controls"
      >
        {isExpanded ? "Hide Controls" : "Show Controls"}
      </button>
      {isExpanded && (
        <div className="mt-2 bg-white p-4 rounded shadow">
          <h2 className="text-lg font-bold mb-2">Map Legend</h2>
          <ul>
            <li>🟢 Open Dispensaries</li>
            <li>🟡 Coming Soon</li>
            <li>🔴 Temporarily Closed</li>
          </ul>
          {/* Add more custom controls or information here */}
        </div>
      )}
    </div>
  )
}
