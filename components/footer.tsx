"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram } from "lucide-react"
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import CookiePreferences from "./cookie-preferences"
import { useState } from "react"

export default function Footer() {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1,
  })
  const [cookiePreferencesOpen, setCookiePreferencesOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

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
        className="py-6 px-6 bg-[#ffd6c0] mt-auto relative"
        variants={containerVariants}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        style={{ "--delay": "2.5s" } as React.CSSProperties}
      >
        {/* Decorative color bar */}
        <motion.div
          className="absolute left-0 right-0 h-1 bg-gradient-to-r from-white to-white top-4"
          initial={{ scaleX: 0 }}
          animate={inView ? { scaleX: 1 } : { scaleX: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        ></motion.div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Desktop layout with logo and nav side by side */}
          <div className="hidden md:flex items-center">
            {/* Logo */}
            <motion.div variants={itemVariants} className="flex-shrink-0">
              <Link
                href="/"
                className="transition-all duration-300 hover:filter hover:drop-shadow-glow flex items-center justify-center"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
                  alt="hai."
                  width={120}
                  height={120}
                  priority
                  className="w-[120px] h-[120px] object-contain"
                />
              </Link>
            </motion.div>

            {/* Navigation links - Desktop - now with increased left margin */}
            <motion.div
              variants={itemVariants}
              className="flex items-center ml-8 h-[120px]"
              style={{ columnGap: "3rem" }}
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

            {/* Social media and tagline - pushed to the right */}
            <motion.div className="flex items-center ml-auto" variants={itemVariants}>
              <p className="text-sm text-black mr-4 font-semibold hidden sm:block">find us on social media</p>
              <div className="flex space-x-6">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                    <Instagram size={24} />
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
          </div>

          {/* Mobile layout */}
          <div className="md:hidden flex flex-col items-center">
            {/* Logo */}
            <motion.div variants={itemVariants} className="mb-4">
              <Link
                href="/"
                className="transition-all duration-300 hover:filter hover:drop-shadow-glow flex items-center justify-center"
              >
                <Image
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
                  alt="hai."
                  width={100}
                  height={100}
                  priority
                  className="w-[100px] h-[100px] object-contain"
                />
              </Link>
            </motion.div>

            {/* Mobile Navigation Grid - positioned directly below logo */}
            <motion.div variants={itemVariants} className="grid grid-cols-2 gap-y-4 gap-x-2 mt-2 mb-6 w-full max-w-xs">
              <Link
                href="/products"
                className="text-black text-base font-semibold hover:underline py-2 px-4 text-center bg-white/20 rounded-md"
              >
                products
              </Link>
              <Link
                href="/lifestyle"
                className="text-black text-base font-semibold hover:underline py-2 px-4 text-center bg-white/20 rounded-md"
              >
                lifestyle
              </Link>
              <Link
                href="/contact"
                className="text-black text-base font-semibold hover:underline py-2 px-4 text-center bg-white/20 rounded-md"
              >
                contact
              </Link>
              <Link
                href="/map"
                className="text-black text-base font-semibold hover:underline py-2 px-4 text-center bg-white/20 rounded-md"
              >
                store locator
              </Link>
              <Link
                href="/wholesale"
                className="text-black text-base font-semibold hover:underline py-2 px-4 text-center bg-white/20 rounded-md col-span-2"
              >
                wholesale
              </Link>
            </motion.div>

            {/* Social media icons */}
            <motion.div className="flex items-center justify-center mt-2" variants={itemVariants}>
              <div className="flex space-x-6">
                <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                  <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                    <Instagram size={24} />
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
          </div>

          {/* Terms links at the bottom */}
          <motion.div
            className="max-w-6xl mx-auto mt-6 flex flex-col sm:flex-row justify-center items-center relative z-10"
            variants={itemVariants}
          >
            <div className="flex flex-col sm:flex-row items-center text-sm text-black font-semibold sm:space-x-8">
              <Link href="/user-agreement" className="hover:text-black transition-colors mb-3 sm:mb-0">
                user agreement
              </Link>
              <Link href="/privacy-policy" className="hover:text-black transition-colors mb-3 sm:mb-0">
                privacy policy
              </Link>
              <button
                onClick={() => setCookiePreferencesOpen(true)}
                className="hover:text-black transition-colors text-black text-sm font-semibold cursor-pointer footer-link"
              >
                cookies preferences
              </button>
            </div>
          </motion.div>
        </div>
      </motion.footer>

      <CookiePreferences open={cookiePreferencesOpen} onOpenChange={setCookiePreferencesOpen} />
    </>
  )
}
