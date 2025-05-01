"use client"

import type React from "react"
import Link from "next/link"
import Image from "next/image"
import { Instagram, Map } from "lucide-react"
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
        className="py-3 px-6 bg-[#ffd6c0] mt-auto relative"
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

        <div className="max-w-6xl mx-auto flex justify-between items-center relative z-10">
          {/* Left section with logo and navigation links */}
          <motion.div variants={itemVariants} className="flex items-center">
            {/* Logo */}
            <Link href="/" className="transition-all duration-300 hover:filter hover:drop-shadow-glow mr-6">
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
                alt="hai."
                width={99}
                height={50}
                priority
                className="" /* Remove the "invert" class */
              />
            </Link>

            {/* Navigation links moved next to logo */}
            <div className="hidden md:flex items-center space-x-6">
              <Link href="/products" className="text-black text-sm font-medium hover:underline">
                products
              </Link>
              <Link href="/blog" className="text-black text-sm font-medium hover:underline">
                lifestyle
              </Link>
              <Link href="/map" className="text-black text-sm font-medium hover:underline flex items-center">
                <Map className="mr-1 h-3 w-3" />
                store locator
              </Link>
              <Link href="/contact" className="text-black text-sm font-medium hover:underline">
                contact
              </Link>
            </div>
          </motion.div>

          {/* Social media and tagline on the right */}
          <motion.div className="flex items-center" variants={itemVariants}>
            <p className="text-sm text-black mr-4 font-medium hidden sm:block">find us on social media</p>
            <div className="flex space-x-4">
              <motion.div whileHover={{ scale: 1.2, rotate: 5 }} whileTap={{ scale: 0.9 }}>
                <Link href="#" aria-label="Instagram" className="text-black hover:text-[#000000] transition-colors">
                  <Instagram size={20} />
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
                    width="20"
                    height="20"
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
        <motion.div className="max-w-6xl mx-auto mt-2 flex justify-center relative z-10" variants={itemVariants}>
          <div className="flex space-x-4 text-xs text-black font-medium">
            <Link href="/user-agreement" className="hover:text-black transition-colors">
              user agreement
            </Link>
            <Link href="/privacy-policy" className="hover:text-black transition-colors">
              privacy policy
            </Link>
            <button
              onClick={() => setCookiePreferencesOpen(true)}
              className="hover:text-black transition-colors text-black text-xs font-medium cursor-pointer"
            >
              cookies preferences
            </button>
          </div>
        </motion.div>
      </motion.footer>

      <CookiePreferences open={cookiePreferencesOpen} onOpenChange={setCookiePreferencesOpen} />
    </>
  )
}
