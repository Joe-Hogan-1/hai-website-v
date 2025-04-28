import Image from "next/image"

export default function BackgroundShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-200 to-pink-200 opacity-50"></div>
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
            alt="hai. embrace the glow"
            width={600}
            height={300}
            className="opacity-20"
          />
          <div className="absolute inset-0 bg-[#ffd6c0] filter blur-3xl opacity-20"></div>
        </div>
      </div>
      <div className="waterfall-container">
        {[...Array(50)].map((_, i) => (
          <div key={i} className="water-drop"></div>
        ))}
      </div>
    </div>
  )
}
