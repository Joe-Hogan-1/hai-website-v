"use client"

import { useCallback, useEffect, useState } from "react"

// Add TypeScript declarations for global reCAPTCHA
declare global {
  interface Window {
    grecaptcha: {
      ready: (callback: () => void) => void
      execute: (siteKey: string, options: { action: string }) => Promise<string>
    }
  }
}

interface ReCAPTCHAProps {
  siteKey: string
  onChange: (token: string) => void
}

export const ReCAPTCHA = ({ siteKey, onChange }: ReCAPTCHAProps) => {
  const [scriptLoaded, setScriptLoaded] = useState(false)

  const handleVerify = useCallback(() => {
    if (window.grecaptcha && typeof window.grecaptcha.execute === "function") {
      window.grecaptcha
        .execute(siteKey, { action: "submit" })
        .then((token: string) => {
          onChange(token)
        })
        .catch((error: any) => {
          console.error("reCAPTCHA error:", error)
        })
    }
  }, [onChange, siteKey])

  useEffect(() => {
    const script = document.createElement("script")
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`
    script.async = true
    script.defer = true
    script.onload = () => setScriptLoaded(true)
    script.onerror = () => console.error("reCAPTCHA script failed to load")

    document.head.appendChild(script)

    return () => {
      document.head.removeChild(script)
    }
  }, [siteKey])

  useEffect(() => {
    if (scriptLoaded) {
      handleVerify()
    }
  }, [scriptLoaded, handleVerify])

  return null
}

export async function verifyRecaptchaToken(token: string): Promise<boolean> {
  if (!token) return false

  try {
    const secretKey = process.env.RECAPTCHA_SECRET_KEY
    if (!secretKey) {
      console.error("Missing RECAPTCHA_SECRET_KEY environment variable")
      return false
    }

    const response = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `secret=${secretKey}&response=${token}`,
    })

    const data = await response.json()
    return data.success && data.score >= 0.5 // For v3, check score
  } catch (error) {
    console.error("reCAPTCHA verification error:", error)
    return false
  }
}
