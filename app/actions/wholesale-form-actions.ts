"use server"

import { revalidatePath } from "next/cache"

type FormSubmissionResult = {
  success: boolean
  message?: string
  error?: string
}

// Simple spam detection based on timing and content
function detectSpam(formData: FormData): { isSpam: boolean; reason?: string } {
  try {
    // Get timing data
    const formLoadTime = Number.parseInt((formData.get("formLoadTime") as string) || "0")
    const submissionTime = Number.parseInt((formData.get("submissionTime") as string) || "0")
    const interactionCount = Number.parseInt((formData.get("interactionCount") as string) || "0")

    // Calculate time spent on form
    const timeSpentMs = submissionTime - formLoadTime
    const timeSpentSeconds = timeSpentMs / 1000

    // Check for suspiciously quick submissions (less than 5 seconds)
    if (timeSpentSeconds < 5) {
      return { isSpam: true, reason: "submitted-too-quickly" }
    }

    // Check for lack of user interaction (less than 3 interactions)
    if (interactionCount < 3) {
      return { isSpam: true, reason: "insufficient-interaction" }
    }

    // Check message content for spam patterns
    const message = ((formData.get("message") as string) || "").toLowerCase()

    // Check for excessive URLs
    const urlCount = (message.match(/https?:\/\//g) || []).length
    if (urlCount > 2) {
      return { isSpam: true, reason: "excessive-urls" }
    }

    // Check for common spam keywords
    const spamKeywords = [
      "viagra",
      "cialis",
      "casino",
      "lottery",
      "prize",
      "winner",
      "bitcoin",
      "investment",
      "loan",
      "mortgage",
      "debt",
      "weight loss",
      "diet pill",
    ]

    for (const keyword of spamKeywords) {
      if (message.includes(keyword)) {
        return { isSpam: true, reason: "spam-content" }
      }
    }

    return { isSpam: false }
  } catch (error) {
    // If there's an error in spam detection, allow the submission
    return { isSpam: false }
  }
}

export async function submitWholesaleForm(formData: FormData): Promise<FormSubmissionResult> {
  try {
    // Get form data
    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const phone = formData.get("phone") as string
    const dispensaryName = formData.get("dispensaryName") as string
    const licenseNumber = formData.get("licenseNumber") as string
    const message = formData.get("message") as string

    // Basic validation
    if (!name || !email || !phone || !dispensaryName || !licenseNumber || !message) {
      return {
        success: false,
        error: "Please fill out all required fields.",
      }
    }

    // Check for spam using our new detection system
    const spamCheck = detectSpam(formData)
    if (spamCheck.isSpam) {
      // Return a generic error to avoid giving information to spammers
      return {
        success: false,
        error: "Your submission could not be processed. Please try again later.",
      }
    }

    // Prepare data for Formspree
    const formspreeData = new FormData()
    formspreeData.append("name", name)
    formspreeData.append("email", email)
    formspreeData.append("phone", phone)
    formspreeData.append("dispensaryName", dispensaryName)
    formspreeData.append("licenseNumber", licenseNumber)
    formspreeData.append("message", message)
    formspreeData.append("form", "wholesale") // Add form identifier

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
        error: `Failed to send inquiry. Status: ${response.status}`,
      }
    }

    const result = await response.json()

    revalidatePath("/wholesale")

    return {
      success: true,
      message: "Your wholesale inquiry has been sent successfully!",
    }
  } catch (error) {
    return {
      success: false,
      error: "An unexpected error occurred. Please try again later.",
    }
  }
}
