"use client"

import type React from "react"
import { useState } from "react"
import Image from "next/image"

interface ImageWithFallbackProps {
  src: string
  fallbackSrc: string
  alt: string
  width: number
  height: number
}

const ImageWithFallback: React.FC<ImageWithFallbackProps> = ({ src, fallbackSrc, alt, ...rest }) => {
  const [imgSrc, setImgSrc] = useState(src)

  return (
    <Image
      {...rest}
      src={imgSrc || "/placeholder.svg"}
      alt={alt}
      onError={() => {
        setImgSrc(fallbackSrc)
      }}
    />
  )
}

export default ImageWithFallback
