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
        className="py-0 md:py-0 px-6 bg-[#ffd6c0] mt-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ "--delay": "2.5s" } as React.CSSProperties}
      >
        {/* Decorative color bar */}
        <motion.div
          className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-white to-white top-1"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        ></motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Desktop layout */}
          <div className="hidden md:block">
            <div className="grid grid-cols-12 gap-0 items-center py-1">
              {/* Logo */}
              <motion.div variants={itemVariants} className="col-span-2 pl-[12px]">
                <Logo className="scale-90 origin-left" />
              </motion.div>

              {/* Navigation links */}
              <motion.div
                variants={itemVariants}
                className="col-span-6 flex items-center h-[30px]"
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
                    <Link
                      href="http://www.instagram.com/hai_designs_"
                      aria-label="Instagram"
                      className="text-black hover:text-[#000000] transition-colors"
                    >
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

            {/* Terms links */}
            <motion.div
              variants={itemVariants}
              className="flex justify-center items-center py-1 mt-[-8px] border-t border-transparent"
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

          {/* Mobile layout - redesigned for better spacing */}
          <div className="md:hidden py-4 space-y-6">
            {/* Logo section */}
            <motion.div variants={itemVariants} className="flex justify-center">
              <Logo className="scale-90" />
            </motion.div>

            {/* Main navigation links - stacked vertically */}
            <motion.div variants={itemVariants} className="flex flex-col items-center space-y-4">
              <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-center">
                <Link href="/products" className="text-black text-base font-semibold hover:underline py-2">
                  products
                </Link>
                <Link href="/lifestyle" className="text-black text-base font-semibold hover:underline py-2">
                  lifestyle
                </Link>
                <Link href="/contact" className="text-black text-base font-semibold hover:underline py-2">
                  contact
                </Link>
                <Link href="/map" className="text-black text-base font-semibold hover:underline py-2">
                  store locator
                </Link>
              </div>

              {/* Wholesale link centered below */}
              <Link href="/wholesale" className="text-black text-base font-semibold hover:underline py-2">
                wholesale
              </Link>
            </motion.div>

            {/* Social media section */}
            <motion.div variants={itemVariants} className="flex flex-col items-center space-y-3">
              <p className="text-sm text-black font-semibold">find us on social media</p>
              <div className="flex space-x-6">
                <motion.div whileHover={{ scale: 1.2 }} whileTap={{ scale: 0.9 }}>
                  <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                    <Instagram size={24} />
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
                      width="24"
                      height="24"
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

            {/* Terms links - stacked vertically for better readability */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col items-center space-y-3 pt-4 border-t border-black/10"
            >
              <Link href="/user-agreement" className="text-black text-sm font-semibold hover:underline py-1">
                user agreement
              </Link>
              <Link href="/privacy-policy" className="text-black text-sm font-semibold hover:underline py-1">
                privacy policy
              </Link>
              <button
                onClick={() => setCookiePreferencesOpen(true)}
                className="text-black text-sm font-semibold hover:underline cursor-pointer py-1"
              >
                cookies preferences
              </button>
            </motion.div>
          </div>
        </div>
      </motion.footer>

      <CookiePreferences open={cookiePreferencesOpen} onOpenChange={setCookiePreferencesOpen} />
    </>
  )
}
