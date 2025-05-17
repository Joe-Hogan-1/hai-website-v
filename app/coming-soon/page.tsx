"use client"

import { useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { supabase } from "@/utils/supabase"
import { FormProvider, useForm } from "react-hook-form"

export default function ComingSoonPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()

  const methods = useForm({
    defaultValues: {
      email: "",
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods

  async function onSubmit(data: { email: string }) {
    setIsSubmitting(true)

    try {
      // Check if email already exists
      const { data: existingEmails, error: checkError } = await supabase
        .from("newsletter")
        .select("id")
        .eq("email", data.email)

      if (checkError) {
        throw new Error(checkError.message)
      }

      // If email already exists, acknowledge without error
      if (existingEmails && existingEmails.length > 0) {
        setMessage("Thank you for your interest! Your email was already registered.")
        setSubmitted(true)
        return
      }

      // Save email to newsletter table
      const { error } = await supabase.from("newsletter").insert([{ email: data.email, source: "coming_soon_page" }])

      if (error) {
        throw new Error(error.message)
      }

      setMessage("Thank you! We'll notify you when we launch.")
      setSubmitted(true)
    } catch (error) {
      console.error("Error submitting email:", error)
      setMessage("Something went wrong. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white">
      {/* Logo at top */}
      <div className="absolute top-10 left-1/2 transform -translate-x-1/2">
        <Image src="/logo.png" alt="hai logo" width={120} height={60} className="object-contain" priority />
      </div>

      <div className="max-w-lg w-full mx-4 md:mx-auto text-center z-10 relative">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">coming soon</h1>

        <p className="text-xl md:text-2xl mb-10">discover the intersection of wellness and a life well lived</p>

        {!submitted ? (
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-md mx-auto">
              <div className="flex flex-col space-y-4">
                <div className="relative">
                  <input
                    type="email"
                    {...register("email", {
                      required: "Email is required",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Invalid email address",
                      },
                    })}
                    className="w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/50"
                    placeholder="your email"
                  />
                  {errors.email && (
                    <span className="text-red-400 text-sm mt-1 block text-left">{errors.email.message}</span>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-white text-black py-3 px-6 rounded-lg font-medium transition-all hover:bg-opacity-90 disabled:opacity-50"
                >
                  {isSubmitting ? "sending..." : "notify me"}
                </button>
              </div>
            </form>
          </FormProvider>
        ) : (
          <div className="bg-white/10 border border-white/30 rounded-lg p-6">
            <p className="text-xl">{message}</p>
          </div>
        )}

        <p className="text-sm mt-8 text-white/70">© {new Date().getFullYear()} hai. all rights reserved.</p>
      </div>

      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black pointer-events-none" />

      {/* Large watermark in background */}
      <div className="absolute bottom-0 right-0 text-white/5 text-[20rem] font-bold leading-none pointer-events-none select-none overflow-hidden">
        hai
      </div>
    </div>
  )
}
