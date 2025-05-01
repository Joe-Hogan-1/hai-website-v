"use client"

import type React from "react"
import WaterRipple from "./water-ripple"
import { motion } from "framer-motion"

const WaterBackground: React.FC = () => {
  return (
    <div className="water-background">
      <motion.div
        className="water-overlay"
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%"],
        }}
        transition={{
          duration: 20,
          ease: "linear",
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      ></motion.div>
      <WaterRipple />
    </div>
  )
}

export default WaterBackground
