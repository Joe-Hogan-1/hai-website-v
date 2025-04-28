import type React from "react"

const VideoBackground: React.FC = () => {
  return (
    <div className="fixed top-0 left-0 w-full h-full overflow-hidden z-[-1]">
      <video
        autoPlay
        loop
        muted
        playsInline
        className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2"
      >
        <source src="/videos/lifestyle-background.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="absolute inset-0 bg-[#ffd6c0] opacity-50"></div>
    </div>
  )
}

export default VideoBackground
