"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

export default function ChatPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    // Check if the popup has been dismissed in this session
    const dismissed = sessionStorage.getItem("chatPopupDismissed") === "true"
    if (dismissed) {
      setIsDismissed(true)
      return
    }

    // Show popup after 3 seconds
    const timer = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsVisible(false)
    setIsDismissed(true)
    // Remember that the user dismissed the popup in this session
    sessionStorage.setItem("chatPopupDismissed", "true")
  }

  if (isDismissed) return null

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed bottom-6 right-6 z-50 max-w-xs w-full bg-[#ffd6c0] rounded-lg shadow-lg overflow-hidden"
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          transition={{ duration: 0.3 }}
        >
          <div className="p-4 relative">
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 text-black hover:text-gray-700 transition-colors"
              aria-label="Close popup"
            >
              <X size={18} />
            </button>

            <h3 className="text-black font-semibold mb-2 pr-6">have questions about hai.</h3>
            <p className="text-black text-sm mb-4">chat with us!</p>

            <Link
              href="/contact"
              className="block w-full bg-black text-center font-semibold py-2 px-4 rounded transition-colors outline-none focus:outline-none focus:ring-0 select-none no-tap-highlight"
              style={{
                color: "white",
                WebkitTapHighlightColor: "none",
                WebkitTouchCallout: "none",
                userSelect: "none",
                MozUserSelect: "none",
                msUserSelect: "none",
                WebkitUserSelect: "none",
                outline: "none",
                textDecoration: "none",
              }}
            >
              <span className="text-white">contact us</span>
            </Link>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
