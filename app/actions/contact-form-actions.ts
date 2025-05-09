"use server"

import { verifyRecaptchaToken } from "./recaptcha-actions"

type FormSubmissionResult = {
  success: boolean
  message?: string
  error?: string
}

export async function submitContactForm(formData: FormData): Promise<FormSubmissionResult> {
  try {
    // Verify reCAPTCHA token
    const recaptchaToken = formData.get("g-recaptcha-response") as string
    const isRecaptchaValid = await verifyRecaptchaToken(recaptchaToken)

    if (!isRecaptchaValid) {
      return {
        success: false,
        error: "reCAPTCHA verification failed. Please try again.",
      }
    }

    // Get form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string
    const phone = formData.get("phone") as string
    const company = formData.get("company") as string

    // Basic validation
    if (!name || !email || !message) {
      return {
        success: false,
        error: "Please fill out all required fields.",
      }
    }

    // Prepare data for Formspree
    const formspreeData = new FormData()
    formspreeData.append("name", name)
    formspreeData.append("email", email)
    formspreeData.append("message", message)
    if (phone) formspreeData.append("phone", phone)
    if (company) formspreeData.append("company", company)

    // Submit to Formspree
    const formspreeEndpoint = process.env.FORMSPREE_ENDPOINT
    if (!formspreeEndpoint) {
      console.error("Missing FORMSPREE_ENDPOINT environment variable")
      return {
        success: false,
        error: "Server configuration error. Please try again later.",
      }
    }

    const response = await fetch(formspreeEndpoint, {
      method: "POST",
      body: formspreeData,
      headers: {
        Accept: "application/json",
      },
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: "Your message has been sent successfully!",
      }
    } else {
      console.error("Formspree error:", result)
      return {
        success: false,
        error: "Failed to send message. Please try again later.",
      }
    }
  } catch (error) {
    console.error("Error submitting form:", error)
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}
