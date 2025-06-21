"use client"

import { usePathname } from "next/navigation"
import Footer from "./footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  const noFooterPaths = ["/signin", "/age-verification"]

  if (noFooterPaths.includes(pathname) || pathname.startsWith("/dashboard")) {
    return null
  }

  return <Footer />
}
