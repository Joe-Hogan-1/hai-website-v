"use client"

import { useState } from "react"
import { trackAgeVerification } from "@/utils/user-data"
import Link from "next/link"
import Image from "next/image"
import { motion } from "framer-motion"

interface AgeGateProps {
  onVerify: () => void
}

export default function AgeGate({ onVerify }: AgeGateProps) {
  const [isDissolving, setIsDissolving] = useState(false)

  const handleVerify = async () => {
    setIsDissolving(true)

    // Store verification in sessionStorage
    sessionStorage.setItem("ageVerified", "true")

    // Track the age verification in Supabase if consent was given
    if (document.cookie.includes("cookie_consent=true")) {
      await trackAgeVerification(true)
    }

    setTimeout(() => {
      onVerify()
    }, 800)
  }

  const handleReject = async () => {
    // Track the rejection in Supabase if consent was given
    if (document.cookie.includes("cookie_consent=true")) {
      await trackAgeVerification(false)
    }

    // Redirect to responsibility.org
    window.location.href = "https://www.responsibility.org/"
  }

  return (
    <div className={`fixed inset-0 z-50 flex justify-center items-center bg-white ${isDissolving ? "fade-out" : ""}`}>
      <div className="bg-[#ffd6c0] p-12 w-full max-w-4xl rounded-sm flex flex-col items-center justify-center min-h-[400px]">
        {/* Add the large logo here */}
        <div className="mb-8 w-[300px] h-[300px]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center"
          >
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/hai_logo_transparent_black-83ImGs5RWDRJ4m77zReENm6jy5pGP3.png"
              alt="hai."
              width={300}
              height={300}
              priority
              className="w-[300px] h-[300px] object-contain"
            />
          </motion.div>
        </div>

        <h2 className="text-xl mb-8 font-semibold">Are you 21 or older?</h2>
        <div className="flex gap-8">
          <button
            onClick={handleVerify}
            className="px-6 py-2 bg-[#ffd6c0] border border-black hover:bg-[#ffcbb0] button-hover font-medium"
          >
            yes
          </button>
          <button
            onClick={handleReject}
            className="px-6 py-2 bg-[#ffd6c0] border border-black hover:bg-[#ffcbb0] button-hover font-medium"
          >
            no
          </button>
        </div>

        <div className="mt-12 text-center text-sm">
          <p className="text-gray-700">
            By entering this site, you agree to our{" "}
            <Link href="/user-agreement" className="underline hover:text-black" target="_blank">
              User Agreement
            </Link>{" "}
            and{" "}
            <Link href="/privacy-policy" className="underline hover:text-black" target="_blank">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
