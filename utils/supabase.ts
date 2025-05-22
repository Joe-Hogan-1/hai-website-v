// This file is deprecated - use lib/supabase-client.ts instead
// Keeping this file for backward compatibility

import {
  getBrowserClient,
  checkSupabaseConnection as checkSupabaseConnectionNew,
  checkStorageBucket as checkStorageBucketNew,
} from "@/lib/supabase-client"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Missing Supabase environment variables")
}

// Create a client with realtime disabled to avoid WebSocket errors
export const supabase = getBrowserClient()

// Re-export helper functions
export { checkSupabaseConnectionNew as checkSupabaseConnection, checkStorageBucketNew as checkStorageBucket }
