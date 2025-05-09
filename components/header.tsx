"use client"

import Link from "next/link"
import Logo from "./logo"
import { useAuth } from "@/contexts/auth-context"
import { User, Menu, X } from "lucide-react"
import { useBreakingNews } from "@/contexts/breaking-news-context"
import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"

// Update the header component
export default function Header() {
  const { user } = useAuth()
  const { newsText } = useBreakingNews()
  const [hasBreakingNews, setHasBreakingNews] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

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

  const headerVariants = {
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
    hidden: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.3, ease: "easeInOut" },
    },
  }

  return (
    <motion.header
      className={`px-4 bg-[#ffd6c0] shadow-sm fixed left-0 right-0 z-50 h-16 flex items-center ${hasBreakingNews ? "top-[32px]" : "top-0"}`}
      variants={headerVariants}
      animate="visible"
      initial="visible"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center w-full">
        <div className="flex items-center justify-center">
          <Logo />
        </div>
        <div className="flex items-center">
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:block">
            <ul className="flex space-x-8 items-center mr-8">
              {[
                { name: "products", path: "/products" },
                { name: "lifestyle", path: "/lifestyle" },
                { name: "contact", path: "/contact" },
                { name: "store locator", path: "/map" },
              ].map((item, index) => (
                <motion.li
                  key={item.name}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.3 }}
                >
                  <Link
                    href={item.path}
                    className="header-link text-black text-lg font-medium flex items-center hover:text-[#000000]"
                  >
                    {item.name}
                  </Link>
                </motion.li>
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
                        className="flex items-center bg-white text-[#ffd6c0] px-4 py-2 rounded-full hover:bg-opacity-80 transition-all button-hover font-medium w-full justify-center"
                        onClick={() => setIsOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </div>
                  )}
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {user && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              className="hidden md:block"
            >
              <Link
                href="/dashboard"
                className="flex items-center bg-white text-[#ffd6c0] px-4 py-2 rounded-full hover:bg-opacity-80 transition-all button-hover font-medium"
              >
                <User className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </motion.header>
  )
}
