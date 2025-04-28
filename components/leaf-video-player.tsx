"use client"

import { useEffect, useRef, useState } from "react"
import { useInView } from "react-intersection-observer"

interface LeafVideoPlayerProps {
  videoUrl: string
  title: string
  description: string
}

export default function LeafVideoPlayer({ videoUrl, title, description }: LeafVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [ref, inView] = useInView({
    threshold: 0.3,
    triggerOnce: false,
  })

  // Random starting position and animation duration
  const startPositionX = useRef(Math.random() * 20 - 10) // -10% to 10%
  const startPositionY = useRef(Math.random() * 10) // 0% to 10%
  const floatDuration = useRef(15 + Math.random() * 10) // 15-25s
  const rotationAmount = useRef(Math.random() * 6 - 3) // -3deg to 3deg

  useEffect(() => {
    if (inView) {
      setIsPlaying(true)
      videoRef.current?.play()
    } else {
      setIsPlaying(false)
      videoRef.current?.pause()
    }
  }, [inView])

  return (
    <div
      ref={ref}
      className={`leaf-container transition-opacity duration-1000 ${inView ? "opacity-100" : "opacity-0"}`}
      style={{
        animation: `float ${floatDuration.current}s ease-in-out infinite, 
                   sway ${floatDuration.current * 0.7}s ease-in-out infinite`,
        left: `calc(50% + ${startPositionX.current}%)`,
        top: `${startPositionY.current}%`,
      }}
    >
      <div
        className="leaf-shape"
        style={{
          transform: `rotate(${rotationAmount.current}deg)`,
        }}
      >
        <div className="leaf-video-container">
          <video ref={videoRef} src={videoUrl} autoPlay={isPlaying} loop muted playsInline className="leaf-video" />
        </div>

        <div className="leaf-content">
          <h2 className="text-2xl md:text-3xl font-semibold mb-2">{title}</h2>
          <p className="text-sm md:text-base">{description}</p>
        </div>
      </div>
    </div>
  )
}
