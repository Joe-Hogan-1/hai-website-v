// This file is deprecated - use supabase-browser.ts for client-side and supabase-server.ts for server-side
// Keeping this file for backward compatibility, but it should not be used in new code

import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a client with realtime disabled to avoid WebSocket errors
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    storageKey: "hai-website-auth",
  },
  global: {
    headers: {
      "X-Client-Info": "hai-website-deprecated",
    },
  },
  realtime: {
    // Disable realtime subscriptions to avoid WebSocket errors
    enabled: false,
  },
})

// Debug function to check connection
export async function checkSupabaseConnection() {
  try {
    const { data, error } = await supabase.from("breaking_news").select("count(*)").single()
    if (error) {
      console.error("Supabase connection error:", error)
      return false
    }
    console.log("Supabase connection successful:", data)
    return true
  } catch (err) {
    console.error("Unexpected error checking Supabase connection:", err)
    return false
  }
}

// Simplified helper function to check storage bucket access
export async function checkStorageBucket(bucketName = "dispensary-images") {
  try {
    // Simply try to list files in the bucket
    const { error } = await supabase.storage.from(bucketName).list("", { limit: 1 })
    return { exists: !error, accessible: !error, error: error?.message }
  } catch (err) {
    console.error("Error checking storage bucket:", err)
    return { exists: false, error: err.message }
  }
}
