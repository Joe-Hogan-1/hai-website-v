import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Twitter } from "lucide-react"

export default function Footer() {
  return (
    <footer className="py-4 px-6 bg-white mt-auto relative" style={{ "--delay": "2.5s" } as React.CSSProperties}>
      {/* Decorative color bar */}
      <div className="absolute left-0 right-0 h-2 bg-gradient-to-r from-[#ffb6a3] to-[#ffd6c0] top-6"></div>

      <div className="max-w-6xl mx-auto flex justify-between items-center relative z-10">
        {/* Logo on the left */}
        <Link href="/" className="transition-all duration-300 hover:filter hover:drop-shadow-glow">
          <Image
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
            alt="hai."
            width={114}
            height={57}
            priority
          />
        </Link>

        {/* Social media and tagline on the right */}
        <div className="flex items-center">
          <p className="text-sm text-black mr-4 font-medium">find us on social media</p>
          <div className="flex space-x-4">
            <Link href="#" aria-label="Instagram" className="text-black hover:text-[#ffd6c0] transition-colors">
              <Instagram size={20} />
            </Link>
            <Link href="#" aria-label="Twitter" className="text-black hover:text-[#ffd6c0] transition-colors">
              <Twitter size={20} />
            </Link>
          </div>
        </div>
      </div>

      {/* Terms links at the bottom */}
      <div className="max-w-6xl mx-auto mt-6 flex justify-center relative z-10">
        <div className="flex space-x-4 text-xs text-gray-500 font-medium">
          <Link href="/user-agreement" className="hover:text-gray-700 transition-colors">
            User Agreement
          </Link>
          <Link href="/privacy-policy" className="hover:text-gray-700 transition-colors">
            Privacy Policy
          </Link>
        </div>
      </div>
    </footer>
  )
}
