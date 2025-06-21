"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribeToNewsletter } from "@/app/actions/newsletter-actions"
import { toast } from "sonner"
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"

export default function NewsletterPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const [isTabVisible, setIsTabVisible] = useState(true)
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hasSubscribed, setHasSubscribed] = useState(false)
  const [hasShownPopup, setHasShownPopup] = useState(false)
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)
  const pathname = usePathname()

  // Check if user has previously subscribed
  useEffect(() => {
    const hasSubscribed = localStorage.getItem("newsletter_subscribed") === "true"
    setHasSubscribed(hasSubscribed)

    // Check if popup has been shown in this session
    const popupShown = sessionStorage.getItem("newsletter_popup_shown") === "true"
    setHasShownPopup(popupShown)
  }, [])

  // Auto-show popup after 5 seconds on homepage
  useEffect(() => {
    // Only trigger on homepage and if not already subscribed or shown
    if (pathname === "/" && !hasSubscribed && !hasShownPopup) {
      const timer = setTimeout(() => {
        setIsOpen(true)
        // Mark as shown in this session
        sessionStorage.setItem("newsletter_popup_shown", "true")
        setHasShownPopup(true)
      }, 5000) // 5 seconds

      return () => clearTimeout(timer)
    }
  }, [pathname, hasSubscribed, hasShownPopup])

  const handleMouseEnter = () => {
    // Clear any existing close timer
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    // Set a timer to close after 3 seconds
    closeTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 3000)
  }

  const handleClose = () => {
    setIsOpen(false)
    // Hide the tab temporarily when closing with the X button
    setIsTabVisible(false)

    // Show the tab again after a delay
    setTimeout(() => {
      setIsTabVisible(true)
    }, 5000) // 5 seconds delay before showing the tab again
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !email.trim()) {
      toast.error("Please fill in all fields")
      return
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      toast.error("Please enter a valid email address")
      return
    }

    setIsSubmitting(true)

    try {
      const result = await subscribeToNewsletter(name, email)

      if (result.success) {
        toast.success(result.message || "Thank you for subscribing to our newsletter!")
        setName("")
        setEmail("")
        setIsOpen(false)
        setHasSubscribed(true)
        localStorage.setItem("newsletter_subscribed", "true")
      } else {
        console.error("Subscription error:", result)
        toast.error(result.message || "Failed to subscribe. Please try again.")
      }
    } catch (error) {
      console.error("Newsletter submission error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Don't show the tab if user has already subscribed
  if (hasSubscribed) return null

  // Animation variants for smoother transitions
  const formVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.4,
      },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.4,
      },
    },
  }

  const tabVariants = {
    hidden: {
      x: "100%",
      opacity: 0,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        duration: 0.3,
        ease: "easeInOut",
      },
    },
  }

  // Animation variants for form elements with staggered animation
  const formElementsVariants = {
    hidden: {
      x: 20,
      opacity: 0,
    },
    visible: (custom: number) => ({
      x: 0,
      opacity: 1,
      transition: {
        delay: 0.1 + custom * 0.1,
        duration: 0.4,
        ease: "easeOut",
      },
    }),
  }

  return (
    <div className="fixed right-0 top-1/3 z-50">
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed right-0 top-1/3 z-50 max-w-sm w-full"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={formVariants}
          >
            <div className="bg-white/90 backdrop-blur-sm shadow-lg rounded-l-lg overflow-hidden newsletter-popup-shadow">
              <div className="p-5">
                <motion.div
                  className="flex justify-between items-start mb-3"
                  variants={formElementsVariants}
                  initial="hidden"
                  animate="visible"
                  custom={0}
                >
                  <h3 className="text-lg font-semibold">Join the hai. community</h3>
                  <button
                    onClick={handleClose}
                    className="newsletter-close-btn p-1 rounded-full hover:bg-gray-100"
                    aria-label="Close newsletter popup"
                    style={{ backgroundColor: "transparent", border: "none", boxShadow: "none" }}
                  >
                    <X size={20} className="text-black" />
                  </button>
                </motion.div>

                <motion.p
                  className="text-sm text-gray-600 mb-4"
                  variants={formElementsVariants}
                  initial="hidden"
                  animate="visible"
                  custom={1}
                >
                  Sign up for exclusive offers and deals, and stay up to date with the latest hai. offerings!
                </motion.p>

                <form onSubmit={handleSubmit} className="space-y-3">
                  <motion.div variants={formElementsVariants} initial="hidden" animate="visible" custom={2}>
                    <Input
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-white/50 border-transparent focus:border-black focus:ring-black"
                      required
                    />
                  </motion.div>
                  <motion.div variants={formElementsVariants} initial="hidden" animate="visible" custom={3}>
                    <Input
                      type="email"
                      placeholder="Your Email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-white/50 border-transparent focus:border-black focus:ring-black"
                      required
                    />
                  </motion.div>
                  <motion.div variants={formElementsVariants} initial="hidden" animate="visible" custom={4}>
                    <Button type="submit" className="w-full newsletter-submit-btn" disabled={isSubmitting}>
                      {isSubmitting ? "Subscribing..." : "Subscribe"}
                    </Button>
                  </motion.div>
                </form>
              </div>
            </div>
          </motion.div>
        ) : isTabVisible ? (
          <motion.div
            className="fixed right-0 top-1/3 z-50"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={tabVariants}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button
              className="bg-black hover:bg-[#333333] text-white py-2 px-3 rounded-l-lg shadow-lg transform transition-transform hover:scale-105"
              style={{ transform: "scale(0.9)" }}
            >
              <span className="block writing-mode-vertical">Newsletter</span>
            </button>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
