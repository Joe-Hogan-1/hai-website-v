"use client"

import Image from "next/image"
import Link from "next/link"
import { useState } from "react"

export default function Logo() {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <div className="flex items-center justify-center h-full py-4">
      <Link
        href="/"
        className="flex items-center transition-all duration-300"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`transform transition-all duration-500 ${isHovered ? "scale-105" : ""}`}>
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
            alt="hai."
            width={163}
            height={81}
            className={`transition-all duration-500 ${isHovered ? "filter drop-shadow-lg" : ""}`}
            priority
          />
        </div>
      </Link>
    </div>
  )
}
