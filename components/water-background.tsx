"use client"

import type React from "react"

const WaterBackground: React.FC = () => {
  return (
    <div className="water-background">
      {/* Water overlay without animation */}
      <div className="water-overlay"></div>
    </div>
  )
}

export default WaterBackground
