"use client"

import { usePathname } from "next/navigation"
import Header from "@/components/header"
import BreakingNewsBar from "@/components/breaking-news-bar"

export default function ClientComponents() {
  const pathname = usePathname()

  // Don't show header and breaking news on age verification page
  if (pathname === "/age-verification") {
    return null
  }

  return (
    <>
      <BreakingNewsBar />
      <Header />
    </>
  )
}
