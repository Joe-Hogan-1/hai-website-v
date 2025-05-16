"use client"

import type React from "react"
import Link from "next/link"
import { Instagram } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CookiePreferences from "./cookie-preferences"
import { useState } from "react"
import Logo from "./logo"

export default function Footer() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [cookiePreferencesOpen, setCookiePreferencesOpen] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.footer
        ref={ref}
        className="py-0 px-6 bg-[#ffd6c0] mt-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ "--delay": "2.5s" } as React.CSSProperties}
      >
        {/* Decorative color bar - thinner and higher */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-white to-white top-1"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        ></motion.div>

        <div className="max-w-7xl mx-auto relative z-10 pt-2 pb-0.5">
          {/* Desktop layout - ultra compact */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12 gap-0 items-center">
              {/* Logo - precisely aligned with header logo */}
              <motion.div variants={itemVariants} className="col-span-2 pl-[12px]">
                <Logo className="scale-90 origin-left" />
              </motion.div>

              {/* Navigation links - Desktop - even shorter height */}
              <motion.div
                variants={itemVariants}
                className="col-span-6 flex items-center h-[35px]"
                style={{ columnGap: "2.5rem" }}
              >
                <Link href="/products" className="text-black text-sm font-semibold hover:underline">
                  products
                </Link>
                <Link href="/lifestyle" className="text-black text-sm font-semibold hover:underline">
                  lifestyle
                </Link>
                <Link href="/contact" className="text-black text-sm font-semibold hover:underline">
                  contact
                </Link>
                <Link href="/map" className="text-black text-sm font-semibold hover:underline">
                  store locator
                </Link>
                <Link href="/wholesale" className="text-black text-sm font-semibold hover:underline">
                  wholesale
                </Link>
              </motion.div>

              {/* Social media icons */}
              <motion.div className="col-span-4 flex justify-end items-center" variants={itemVariants}>
                <p className="text-sm text-black mr-4 font-semibold hidden sm:block">find us on social media</p>
                <div className="flex space-x-4">
                  <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                    <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                      <Instagram size={22} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.2, rotate: -5 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href="#"
                      aria-label="X (formerly Twitter)"
                      className="text-black hover:text-[#000000] transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="22"
                        height="22"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378zm-2.128 2.474-1.017-1.452-4.082-5.83h2.2l3.296 4.708.84 1.2 4.28 6.11h-2.2l-3.317-4.736z" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Terms links in a separate row - with extreme negative margin */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center mt-[-15px] pt-0 border-t border-transparent"
            >
              <div className="flex space-x-8 text-xs text-black font-semibold">
                <Link href="/user-agreement" className="hover:text-black transition-colors">
                  user agreement
                </Link>
                <Link href="/privacy-policy" className="hover:text-black transition-colors">
                  privacy policy
                </Link>
                <button
                  onClick={() => setCookiePreferencesOpen(true)}
                  className="hover:text-black transition-colors text-black text-xs font-semibold cursor-pointer footer-link"
                >
                  cookies preferences
                </button>
              </div>
            </motion.div>
          </div>

          {/* Mobile layout - ultra compact */}
          <div className="md:hidden relative h-[40px]">
            {/* Logo and main links - precisely aligned with header */}
            <div className="absolute left-0 top-0 flex items-start pl-[12px]">
              <motion.div variants={itemVariants} className="mr-2">
                <Logo className="scale-75 origin-left" />
              </motion.div>
              <motion.div variants={itemVariants} className="flex flex-col text-xs">
                <Link href="/products" className="text-black font-semibold hover:underline leading-none mb-0.5">
                  products
                </Link>
                <Link href="/lifestyle" className="text-black font-semibold hover:underline leading-none mb-0.5">
                  lifestyle
                </Link>
                <Link href="/contact" className="text-black font-semibold hover:underline leading-none">
                  contact
                </Link>
              </motion.div>
            </div>

            {/* Secondary links and social */}
            <div className="absolute right-0 top-0 flex flex-col items-end">
              <motion.div variants={itemVariants} className="flex flex-col text-xs text-right">
                <Link href="/map" className="text-black font-semibold hover:underline leading-none mb-0.5">
                  store locator
                </Link>
                <Link href="/wholesale" className="text-black font-semibold hover:underline leading-none">
                  wholesale
                </Link>
              </motion.div>
              <motion.div className="flex items-center justify-end mt-0.5" variants={itemVariants}>
                <div className="flex space-x-3">
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                      <Instagram size={16} />
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                    <Link
                      href="#"
                      aria-label="X (formerly Twitter)"
                      className="text-black hover:text-[#000000] transition-colors"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                        stroke="none"
                      >
                        <path d="M13.982 10.622 20.54 3h-1.554l-5.693 6.618L8.745 3H3.5l6.876 10.007L3.5 21h1.554l6.012-6.989L15.868 21h5.245l-7.131-10.378zm-2.128 2.474-1.017-1.452-4.082-5.83h2.2l3.296 4.708.84 1.2 4.28 6.11h-2.2l-3.317-4.736z" />
                      </svg>
                    </Link>
                  </motion.div>
                </div>
              </motion.div>
            </div>

            {/* Terms links - overlapping with main content */}
            <motion.div
              variants={itemVariants}
              className="absolute bottom-[-2px] left-0 right-0 flex justify-center items-center"
            >
              <div className="flex justify-center space-x-3 text-[10px]">
                <Link href="/user-agreement" className="text-black font-semibold hover:underline">
                  user agreement
                </Link>
                <Link href="/privacy-policy" className="text-black font-semibold hover:underline">
                  privacy policy
                </Link>
                <button
                  onClick={() => setCookiePreferencesOpen(true)}
                  className="text-black font-semibold hover:underline cursor-pointer"
                >
                  cookies preferences
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.footer>

      <CookiePreferences open={cookiePreferencesOpen} onOpenChange={setCookiePreferencesOpen} />
    </>
  )
}
