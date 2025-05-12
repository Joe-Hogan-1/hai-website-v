"use server"

import { createServerClient } from "@/utils/supabase-server"

// Update the subscribeToNewsletter function with better error handling
export async function subscribeToNewsletter(name: string, email: string) {
  try {
    const supabase = createServerClient()

    // Validate inputs
    if (!name.trim() || !email.trim()) {
      return { success: false, message: "Name and email are required" }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { success: false, message: "Please enter a valid email address" }
    }

    // First check if the table exists by trying to get a single row
    const { error: tableCheckError } = await supabase.from("newsletter_subscribers").select("id").limit(1)

    if (tableCheckError) {
      // If the table doesn't exist, create it
      if (tableCheckError.message.includes("does not exist")) {
        // We can't create tables from the client, so return a more helpful error
        return {
          success: false,
          message: "The newsletter_subscribers table does not exist. Please run the migration to create it.",
        }
      }
      return { success: false, message: `Database error: ${tableCheckError.message}` }
    }

    // Check if email already exists
    const { data: existingSubscriber, error: existingCheckError } = await supabase
      .from("newsletter_subscribers")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle()

    if (existingCheckError) {
      return { success: false, message: `Error checking existing subscriber: ${existingCheckError.message}` }
    }

    if (existingSubscriber) {
      return { success: false, message: "This email is already subscribed to our newsletter" }
    }

    // Insert new subscriber
    const { error: insertError } = await supabase.from("newsletter_subscribers").insert({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      created_at: new Date().toISOString(),
    })

    if (insertError) {
      // Check for common errors
      if (insertError.code === "23505") {
        // Unique violation
        return { success: false, message: "This email is already subscribed to our newsletter" }
      }

      if (insertError.code === "42501") {
        // Permission denied
        return { success: false, message: "Permission denied. Check RLS policies." }
      }

      return { success: false, message: `Failed to subscribe: ${insertError.message}` }
    }

    return { success: true, message: "Successfully subscribed to the newsletter!" }
  } catch (error) {
    return {
      success: false,
      message: "An unexpected error occurred",
      details: error instanceof Error ? error.message : String(error),
    }
  }
}

export async function getNewsletterSubscribers(searchTerm = "") {
  try {
    const supabase = createServerClient()

    let query = supabase.from("newsletter_subscribers").select("*").order("created_at", { ascending: false })

    // Apply search filter if provided
    if (searchTerm) {
      query = query.or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%`)
    }

    const { data, error } = await query

    if (error) {
      return { success: false, subscribers: [], message: "Failed to fetch subscribers" }
    }

    return { success: true, subscribers: data || [] }
  } catch (error) {
    return { success: false, subscribers: [], message: "An unexpected error occurred" }
  }
}

export async function deleteNewsletterSubscriber(id: string) {
  try {
    const supabase = createServerClient()

    const { error } = await supabase.from("newsletter_subscribers").delete().eq("id", id)

    if (error) {
      return { success: false, message: "Failed to delete subscriber" }
    }

    return { success: true }
  } catch (error) {
    return { success: false, message: "An unexpected error occurred" }
  }
}
