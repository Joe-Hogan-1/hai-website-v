import { createClient } from "@supabase/supabase-js"

// Get environment variables with fallbacks for development
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://lseluxoxdzvptfyijruj.supabase.co"
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWx1eG94ZHp2cHRmeWlqcnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTU0MTksImV4cCI6MjA1ODQ5MTQxOX0.kA78RUrSKHZaDi70IT3w33scJU19yEuXCjH4pHeq5gM"

// Create and export the Supabase client with storage enabled
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    headers: {
      "X-Client-Info": "hai-website",
    },
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
