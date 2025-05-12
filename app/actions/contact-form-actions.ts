"use server"

import { isLikelySpam } from "@/utils/anti-spam"

type FormSubmissionResult = {
  success: boolean
  message?: string
  error?: string
}

export async function submitContactForm(formData: FormData): Promise<FormSubmissionResult> {
  try {
    // Get form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const message = formData.get("message") as string
    const phone = formData.get("phone") as string

    // Get anti-spam data
    const formStartTime = Number.parseInt((formData.get("formStartTime") as string) || "0")
    const formToken = formData.get("formToken") as string

    // Basic validation
    if (!name || !email || !message) {
      return {
        success: false,
        error: "Please fill out all required fields.",
      }
    }

    // Anti-spam check
    const spamCheck = isLikelySpam(formData, formStartTime, formToken)
    if (spamCheck.isSpam) {
      // For certain types of spam, we silently accept but don't process
      if (spamCheck.reason === "submitted-too-quickly" || spamCheck.reason === "invalid-token") {
        return {
          success: true,
          message: "Thank you for your submission.",
        }
      }

      return {
        success: false,
        error: "Your submission was flagged as potential spam. Please try again.",
      }
    }

    // Prepare data for Formspree
    const formspreeData = new FormData()
    formspreeData.append("name", name)
    formspreeData.append("email", email)
    formspreeData.append("message", message)
    if (phone) formspreeData.append("phone", phone)
    formspreeData.append("form", "contact") // Add form identifier

    // Submit to Formspree
    const formspreeEndpoint = process.env.NEXT_PUBLIC_FORMSPREE_ENDPOINT
    if (!formspreeEndpoint) {
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

    if (!response.ok) {
      return {
        success: false,
        error: `Failed to send message. Status: ${response.status}`,
      }
    }

    const result = await response.json()

    return {
      success: true,
      message: "Your message has been sent successfully!",
    }
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}
