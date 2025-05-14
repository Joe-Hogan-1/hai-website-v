"use client"

import Link from "next/link"
import Logo from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { User, Menu, X } from "lucide-react"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { useEffect, useState } from "react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

export default function Header() {
  const { user } = useAuth()
  const { newsText } = useBreakingNews()
  const [hasBreakingNews, setHasBreakingNews] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    if (newsText) {
      document.body.classList.add("has-breaking-news")
      setHasBreakingNews(true)
    } else {
      document.body.classList.remove("has-breaking-news")
      setHasBreakingNews(false)
    }
  }, [newsText])

  return (
    <div
      className={`fixed left-0 right-0 z-50 ${hasBreakingNews ? "top-[32px]" : "top-0"}`}
      style={{
        height: "70px",
        margin: 0,
        padding: 0,
        borderTop: "none",
        boxShadow: hasBreakingNews ? "none" : "0 1px 3px rgba(0,0,0,0.1)",
      }}
    >
      <header
        className="bg-[#ffd6c0] w-full h-full"
        style={{
          margin: 0,
          padding: 0,
          border: "none",
          borderTop: "none",
          boxShadow: "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center w-full h-full">
          <div className="flex items-center justify-center h-full">
            <Logo />
          </div>
          <div className="flex items-center h-full">
            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden md:block h-full">
              <ul className="flex space-x-8 items-center mr-8 h-full">
                {[
                  { name: "products", path: "/products" },
                  { name: "lifestyle", path: "/lifestyle" },
                  { name: "contact", path: "/contact" },
                  { name: "store locator", path: "/map" },
                ].map((item) => (
                  <li key={item.name} className="h-full flex items-center">
                    <Link
                      href={item.path}
                      className="header-link text-black text-lg font-medium flex items-center hover:text-[#000000] h-full"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Mobile Hamburger Menu */}
            <div className="md:hidden">
              <Sheet open={isOpen} onOpenChange={setIsOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 text-black focus:outline-none" aria-label="Open menu">
                    <Menu size={24} />
                  </button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-[#ffd6c0] border-none p-0 w-[300px]">
                  <div className="flex flex-col h-full">
                    <div className="p-4 border-b border-white/20">
                      <div className="flex justify-between items-center">
                        <Logo />
                        <button
                          onClick={() => setIsOpen(false)}
                          className="p-2 text-black focus:outline-none"
                          aria-label="Close menu"
                        >
                          <X size={24} />
                        </button>
                      </div>
                    </div>
                    <nav className="flex-1 p-6">
                      <ul className="space-y-6">
                        {[
                          { name: "products", path: "/products" },
                          { name: "lifestyle", path: "/lifestyle" },
                          { name: "contact", path: "/contact" },
                          { name: "store locator", path: "/map" },
                        ].map((item) => (
                          <li key={item.name}>
                            <Link
                              href={item.path}
                              className="mobile-nav-link text-black text-xl font-medium flex items-center hover:text-[#000000] transition-colors"
                              onClick={() => setIsOpen(false)}
                            >
                              {item.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </nav>
                    {user && (
                      <div className="p-6 border-t border-white/20">
                        <Link
                          href="/dashboard"
                          className="simple-dashboard-button flex items-center justify-center bg-white text-[#ffd6c0] px-2 py-1 rounded-full hover:bg-opacity-80 transition-all button-hover font-medium w-full text-xs"
                          onClick={() => setIsOpen(false)}
                        >
                          <User className="mr-1 h-3 w-3" />
                          Dashboard
                        </Link>
                      </div>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {user && (
              <div className="hidden md:block">
                <Link
                  href="/dashboard"
                  className="simple-dashboard-button inline-flex items-center bg-white text-[#ffd6c0] px-2 py-1 rounded-full hover:bg-opacity-80 transition-all button-hover font-medium text-xs"
                >
                  <User className="mr-1 h-3 w-3" />
                  Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>
    </div>
  )
}
