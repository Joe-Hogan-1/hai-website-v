import { createClient } from "@supabase/supabase-js"

// Default values for development (these will be overridden by actual env vars if available)
const defaultSupabaseUrl = "https://lseluxoxdzvptfyijruj.supabase.co"
const defaultSupabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxzZWx1eG94ZHp2cHRmeWlqcnVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDI5MTU0MTksImV4cCI6MjA1ODQ5MTQxOX0.kA78RUrSKHZaDi70IT3w33scJU19yEuXCjH4pHeq5gM"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || defaultSupabaseUrl
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || defaultSupabaseKey

export const supabase = createClient(supabaseUrl, supabaseKey)
