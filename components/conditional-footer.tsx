"use client"

import { usePathname } from "next/navigation"
import Footer from "@/components/footer"

export default function ConditionalFooter() {
  const pathname = usePathname()

  // Don't show footer on age verification page
  if (pathname === "/age-verification") {
    return null
  }

  return <Footer />
}
