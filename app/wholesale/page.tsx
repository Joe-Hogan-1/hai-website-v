"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import Header from "@/components/header"
import LeftAlignedTitle from "@/components/left-aligned-title"
import { validateForm, required, email, phone, minLength } from "@/components/contact/form-validator"
import { submitWholesaleForm } from "@/app/actions/wholesale-form-actions"

export default function WholesalePage() {
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<{ [key: string]: string }>({})
  const formRef = useRef<HTMLFormElement>(null)
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const submissionAttempts = useRef(0)
  const formLoadTime = useRef(Date.now())
  const [formToken, setFormToken] = useState("")
  const [interactionCount, setInteractionCount] = useState(0)

  // Generate a simple form token on component mount
  useEffect(() => {
    const token = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}`
    setFormToken(token)
    formLoadTime.current = Date.now()

    // Track user interactions
    const trackInteraction = () => {
      setInteractionCount((prev) => prev + 1)
    }

    // Add event listeners for common user interactions
    window.addEventListener("mousemove", trackInteraction)
    window.addEventListener("keydown", trackInteraction)
    window.addEventListener("scroll", trackInteraction)
    window.addEventListener("click", trackInteraction)

    return () => {
      // Clean up event listeners
      window.removeEventListener("mousemove", trackInteraction)
      window.removeEventListener("keydown", trackInteraction)
      window.removeEventListener("scroll", trackInteraction)
      window.removeEventListener("click", trackInteraction)
    }
  }, [])

  const validationRules = {
    name: [required("Please enter your full name"), minLength(2, "Name must be at least 2 characters")],
    phone: [required("Please enter your phone number"), phone()],
    email: [required("Please enter your email address"), email()],
    dispensaryName: [
      required("Please enter your dispensary name"),
      minLength(2, "Dispensary name must be at least 2 characters"),
    ],
    licenseNumber: [
      required("Please enter your license number"),
      minLength(2, "License number must be at least 2 characters"),
    ],
    message: [required("Please enter a message"), minLength(10, "Message must be at least 10 characters")],
  }

  // Pre-validate form fields as user types
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }
  }

  // Validate a single field
  const validateField = (name: string, value: string) => {
    if (!validationRules[name]) return true

    for (const rule of validationRules[name]) {
      if (!rule.test(value)) {
        setErrors((prev) => ({ ...prev, [name]: rule.message }))
        return false
      }
    }

    return true
  }

  // Handle field blur for immediate validation feedback
  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    validateField(name, value)
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    // Don't allow multiple submissions
    if (isSubmitting) return

    // Track submission attempts for rate limiting
    submissionAttempts.current++
    if (submissionAttempts.current > 5) {
      setErrors({ form: "Too many submission attempts. Please try again later." })
      setTimeout(() => {
        submissionAttempts.current = 0
      }, 60000) // Reset after 1 minute
      return
    }

    setIsSubmitting(true)

    // Clear any previous timeout
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current)
    }

    const form = e.currentTarget
    const formData = new FormData(form)

    // Add metadata for spam detection
    formData.append("formToken", formToken)
    formData.append("formLoadTime", formLoadTime.current.toString())
    formData.append("submissionTime", Date.now().toString())
    formData.append("interactionCount", interactionCount.toString())

    // Validate form
    const validation = validateForm(formData, validationRules)
    if (!validation.isValid) {
      setErrors(validation.errors)
      setIsSubmitting(false)
      return
    }

    // Set a timeout to prevent hanging requests
    submitTimeoutRef.current = setTimeout(() => {
      if (isSubmitting) {
        setIsSubmitting(false)
        setErrors({ form: "Request timed out. Please try again." })
      }
    }, 10000) // 10 second timeout

    try {
      // Submit the form using the server action
      const result = await submitWholesaleForm(formData)

      if (result.success) {
        // Store submission in localStorage as backup
        try {
          const formDataObj = Object.fromEntries(formData.entries())
          const submissions = JSON.parse(localStorage.getItem("wholesaleSubmissions") || "[]")
          submissions.push({
            ...formDataObj,
            timestamp: new Date().toISOString(),
            status: "success",
          })
          localStorage.setItem("wholesaleSubmissions", JSON.stringify(submissions))
        } catch (err) {
          // Silently fail if localStorage isn't available
        }

        setSubmitted(true)
        form.reset()
        setFormData({})
      } else {
        setErrors({ form: result.error || "Form submission failed. Please try again." })
      }
    } catch (err: any) {
      setErrors({ form: "Something went wrong. Please try again." })
    } finally {
      if (submitTimeoutRef.current) {
        clearTimeout(submitTimeoutRef.current)
        submitTimeoutRef.current = null
      }
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <Header />
      <div className="page-container">
        <div className="container mx-auto">
          <LeftAlignedTitle>Wholesale Inquiries</LeftAlignedTitle>
          <div className="bg-[#ffd6c0] p-6 w-full max-w-4xl mx-auto rounded-sm min-h-[400px]">
            {submitted ? (
              <div className="text-center py-8">
                <h2 className="text-2xl font-semibold mb-4">Thank You!</h2>
                <p className="mb-6">Your wholesale inquiry has been sent successfully. We'll get back to you soon.</p>
                <button
                  onClick={() => setSubmitted(false)}
                  className="bg-black text-white px-6 py-2 rounded-sm hover:bg-opacity-80 transition-all"
                >
                  Submit Another Inquiry
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                {/* No honeypot fields */}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      }`}
                      autoComplete="name"
                      placeholder="John Doe"
                    />
                    {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium mb-1">
                      Phone Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                        errors.phone ? "border-red-500" : "border-gray-300"
                      }`}
                      autoComplete="tel"
                      placeholder="(555) 123-4567"
                    />
                    {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email || ""}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    autoComplete="email"
                    placeholder="your.email@example.com"
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="dispensaryName" className="block text-sm font-medium mb-1">
                      Dispensary Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="dispensaryName"
                      name="dispensaryName"
                      value={formData.dispensaryName || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                        errors.dispensaryName ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Green Leaf Dispensary"
                    />
                    {errors.dispensaryName && <p className="mt-1 text-sm text-red-600">{errors.dispensaryName}</p>}
                  </div>

                  <div>
                    <label htmlFor="licenseNumber" className="block text-sm font-medium mb-1">
                      License Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="licenseNumber"
                      name="licenseNumber"
                      value={formData.licenseNumber || ""}
                      onChange={handleInputChange}
                      onBlur={handleBlur}
                      className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                        errors.licenseNumber ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="OCM-12345"
                    />
                    {errors.licenseNumber && <p className="mt-1 text-sm text-red-600">{errors.licenseNumber}</p>}
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium mb-1">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={formData.message || ""}
                    onChange={handleInputChange}
                    onBlur={handleBlur}
                    className={`w-full px-3 py-2 border rounded-sm focus:outline-none focus:ring-1 focus:ring-black ${
                      errors.message ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Please provide details about your wholesale inquiry..."
                  ></textarea>
                  {errors.message && <p className="mt-1 text-sm text-red-600">{errors.message}</p>}
                </div>

                {errors.form && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-sm">
                    {errors.form}
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-black text-white px-8 py-3 rounded-sm hover:bg-opacity-80 transition-all disabled:opacity-50 relative"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="opacity-0">Submit Inquiry</span>
                        <span className="absolute inset-0 flex items-center justify-center">
                          <svg
                            className="animate-spin h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                        </span>
                      </>
                    ) : (
                      "Submit Inquiry"
                    )}
                  </button>
                </div>

                <p className="text-xs text-center text-gray-600 mt-4">
                  Your information will never be sold or used for spam.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
