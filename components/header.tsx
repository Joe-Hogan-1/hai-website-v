"use client"

import Link from "next/link"
import Logo from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { User, Map } from "lucide-react"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { useEffect, useState } from "react"

export default function Header() {
  const { user } = useAuth()
  const { newsText } = useBreakingNews()
  const [hasBreakingNews, setHasBreakingNews] = useState(false)

  useEffect(() => {
    // Add class to body when breaking news is present
    if (newsText) {
      document.body.classList.add("has-breaking-news")
      setHasBreakingNews(true)
    } else {
      document.body.classList.remove("has-breaking-news")
      setHasBreakingNews(false)
    }
  }, [newsText])

  return (
    <header
      className={`py-6 px-8 bg-white shadow-sm fixed left-0 right-0 z-50 h-24 ${hasBreakingNews ? "top-8" : "top-0"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center h-full">
        <Logo />
        <div className="flex items-center">
          <nav>
            <ul className="flex space-x-8 items-center mr-8">
              {["products", "blog", "map", "contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item}`}
                    className="header-link button-hover text-gray-800 text-lg font-medium flex items-center hover:text-[#ffd6c0]"
                  >
                    {item === "map" && <Map className="mr-1 h-4 w-4" />}
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {user && (
            <Link
              href="/dashboard"
              className="flex items-center bg-[#ffd6c0] text-white px-4 py-2 rounded-full hover:bg-opacity-80 transition-all button-hover font-medium"
            >
              <User className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
