"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { subscribeToNewsletter } from "@/app/actions/newsletter-actions"
import { toast } from "sonner"

export default function NewsletterSignup() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

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
      } else {
        console.error("Subscription error:", result)
        toast.error(result.message || "Failed to subscribe. Please try again.")

        // If it's a table not found error, show a more detailed message
        if (result.message?.includes("table does not exist")) {
          toast.error("Database setup required. Please contact the administrator.")
        }
      }
    } catch (error) {
      console.error("Newsletter submission error:", error)
      toast.error("An unexpected error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
      <h3 className="text-center text-lg font-semibold mb-3 text-black">Stay in the glow</h3>
      <p className="text-center text-sm mb-4 text-black font-medium">
        Subscribe to our newsletter for updates and exclusive offers
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <Input
            type="text"
            placeholder="Your Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-white/50 border-transparent focus:border-[#ffd6c0] focus:ring-[#ffd6c0]"
            required
          />
        </div>
        <div>
          <Input
            type="email"
            placeholder="Your Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/50 border-transparent focus:border-[#ffd6c0] focus:ring-[#ffd6c0]"
            required
          />
        </div>
        <Button type="submit" className="w-full bg-[#ffd6c0] hover:bg-[#ffcbb0] text-white" disabled={isSubmitting}>
          {isSubmitting ? "Subscribing..." : "Subscribe"}
        </Button>
      </form>
    </div>
  )
}
