"use client"

import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

export default function Logo() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex items-center justify-center"
    >
      <Link href="/" className="transition-all duration-300 hover:filter hover:drop-shadow-glow">
        <Image
          src="/hailogo_vector_black.svg"
          alt="hai."
          width={75}
          height={75}
          priority
          className="w-[75px] h-[75px] object-contain"
        />
      </Link>
    </motion.div>
  )
}
