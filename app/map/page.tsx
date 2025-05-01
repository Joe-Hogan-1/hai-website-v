"use client"

import { Suspense } from "react"
import Header from "@/components/header"
import WaterBackground from "@/components/water-background"
import MapPageClient from "@/components/map-page-client"
import { motion } from "framer-motion"

function MapLoadingSkeleton() {
  return (
    <motion.div
      className="h-[600px] w-full flex flex-col items-center justify-center bg-gray-100 rounded-lg"
      initial={{ opacity: 0 }}
      animate={{
        opacity: 1,
        transition: { duration: 0.5 },
      }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-16 h-16 border-4 border-[#ffd6c0] border-t-transparent rounded-full mb-4"
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "linear",
        }}
      ></motion.div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <div className="text-2xl font-bold text-gray-400">Loading Map...</div>
        <p className="text-gray-500 mt-2 text-center">Please wait while we load the dispensary locations...</p>
      </motion.div>
    </motion.div>
  )
}

export default function MapPage() {
  return (
    <>
      <WaterBackground />
      <Header />
      <motion.div
        className="page-container"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto px-4 py-8">
          <motion.h1
            className="text-5xl font-bold mb-6 text-black"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            find hai.
          </motion.h1>
          <motion.p
            className="text-xl mb-8 text-black"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Discover licensed dispensaries in New York State where hai. products are available.
          </motion.p>

          <Suspense fallback={<MapLoadingSkeleton />}>
            <MapPageClient />
          </Suspense>
        </div>
      </motion.div>
    </>
  )
}
