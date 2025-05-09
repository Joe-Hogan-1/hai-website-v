"use server"

import { verifyRecaptchaToken } from "@/app/actions/recaptcha-actions"

export async function submitContactForm(formData: FormData) {
  try {
    // Get the reCAPTCHA token
    const recaptchaToken = formData.get("g-recaptcha-response") as string

    // Verify the token
    const isValid = await verifyRecaptchaToken(recaptchaToken)
    if (!isValid) {
      return { success: false, error: "reCAPTCHA verification failed" }
    }

    // Get the Formspree endpoint from environment variables
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT
    if (!formspreeEndpoint) {
      console.error("Missing FORMSPREE_ENDPOINT environment variable")
      return { success: false, error: "Server configuration error" }
    }

    // Submit the form to Formspree
    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      body: formData,
      headers: {
        Accept: "application/json",
      },
    })

    if (response.ok) {
      return { success: true }
    } else {
      const data = await response.json()
      return { success: false, error: data.error || "Form submission failed" }
    }
  } catch (error) {
    console.error("Error submitting form:", error)
    return { success: false, error: "An unexpected error occurred" }
  }
}
