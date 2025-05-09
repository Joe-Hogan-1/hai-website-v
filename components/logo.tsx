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
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
          alt="hai."
          width={120}
          height={120}
          priority
          className="w-[120px] h-[120px] object-contain"
        />
      </Link>
    </motion.div>
  )
}
