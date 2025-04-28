import type React from "react"
import WaterRipple from "./water-ripple"

const WaterBackground: React.FC = () => {
  return (
    <div className="water-background">
      <div className="water-overlay"></div>
      <WaterRipple />
    </div>
  )
}

export default WaterBackground
