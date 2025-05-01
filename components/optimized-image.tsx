"use client"

import { useState } from "react"
import Image, { type ImageProps } from "next/image"

interface OptimizedImageProps extends Omit<ImageProps, "onLoad"> {
  lowQualitySrc?: string
}

export default function OptimizedImage({ src, alt, lowQualitySrc, className, ...props }: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  return (
    <div className="relative overflow-hidden" style={{ width: "100%", height: "100%" }}>
      {lowQualitySrc && (
        <Image
          src={lowQualitySrc || "/placeholder.svg"}
          alt={alt}
          className={`absolute inset-0 blur-up ${className || ""}`}
          fill={!props.width || !props.height}
          {...props}
        />
      )}
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        className={`blur-up ${isLoaded ? "loaded" : ""} ${className || ""}`}
        onLoad={() => setIsLoaded(true)}
        fill={!props.width || !props.height}
        {...props}
      />
    </div>
  )
}
