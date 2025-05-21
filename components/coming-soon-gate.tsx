"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { subscribeToNewsletter } from "@/app/actions/newsletter-actions"

interface ComingSoonGateProps {
  message?: string
}

export default function ComingSoonGate({ message }: ComingSoonGateProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [responseMessage, setResponseMessage] = useState("")
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    if (!name.trim()) {
      setError("please enter your name")
      setIsSubmitting(false)
      return
    }

    if (!email || !email.includes("@")) {
      setError("please enter a valid email address")
      setIsSubmitting(false)
      return
    }

    try {
      // Use the server action to subscribe to the newsletter
      const result = await subscribeToNewsletter(name, email)

      if (result.success) {
        setResponseMessage("thank you for your interest!")
        setSubmitted(true)
      } else {
        // If the email is already subscribed, still show success
        if (result.message.includes("already subscribed")) {
          setResponseMessage("thank you for your interest! your email was already registered.")
          setSubmitted(true)
        } else {
          setError(result.message)
        }
      }
    } catch (err) {
      console.error("Error submitting email:", err)
      setError("something went wrong. please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center bg-white">
      <div className="bg-[#ffd6c0] p-8 md:p-12 w-full max-w-md md:max-w-lg mx-4 rounded-sm flex flex-col items-center justify-center">
        <div className="mb-8">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
              alt="hai."
              width={180}
              height={90}
              priority
              className="object-contain"
            />
          </motion.div>
        </div>

        <h2 className="text-xl mb-4 font-semibold text-center">coming soon</h2>
        <p className="text-base mb-8 text-center max-w-md">
          {message || "discover the intersection of wellness and a life well lived"}
        </p>

        {!submitted ? (
          <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto mb-6 text-center">
            <div className="flex flex-col space-y-4 items-center">
              <div className="relative">
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffd6c0] border border-black rounded-none text-black placeholder-black/70"
                  placeholder="your name"
                />
              </div>

              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-[#ffd6c0] border border-black rounded-none text-black placeholder-black/70"
                  placeholder="your email"
                />
                {error && <span className="text-black text-sm mt-1 block text-center">{error}</span>}
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-[#ffd6c0] border border-black hover:bg-[#ffcbb0] transition-colors duration-200 font-medium"
              >
                {isSubmitting ? "sending..." : "notify me"}
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-[#ffd6c0] border border-black rounded-none p-6 mb-6 w-full max-w-md">
            <p className="text-center">{responseMessage}</p>
          </div>
        )}

        <div className="mt-2 text-center text-sm">
          <p className="text-gray-700">© {new Date().getFullYear()} hai. All rights reserved.</p>
        </div>
      </div>
    </div>
  )
}
