import Image from "next/image"
import Link from "next/link"

export default function Logo() {
  return (
    <Link href="/" className="flex items-center">
      <Image
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
        alt="hai."
        width={148}
        height={74}
        className="transition-all duration-300 hover:opacity-80"
        priority
      />
    </Link>
  )
}
