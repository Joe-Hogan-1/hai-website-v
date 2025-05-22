import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs"

// Environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Singleton instance for browser usage
let browserClient: ReturnType<typeof createClient> | null = null

// Create a singleton browser client
export const getBrowserClient = () => {
  if (browserClient) return browserClient

  browserClient = createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: true,
      storageKey: "hai-website-auth",
    },
    global: {
      headers: {
        "X-Client-Info": "hai-website-browser",
      },
    },
    realtime: {
      // Disable realtime subscriptions in the browser
      enabled: false,
    },
  })

  return browserClient
}

// Server component client (uses cookies)
export const getServerClient = () => {
  const cookieStore = cookies()
  return createServerComponentClient({ cookies: () => cookieStore })
}

// Direct server client (for API routes)
export const getDirectServerClient = () => {
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "hai-website-server",
      },
    },
  })
}

// Helper function to check connection
export async function checkSupabaseConnection() {
  try {
    const client = getBrowserClient()
    const { data, error } = await client.from("breaking_news").select("count(*)").single()
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

// Helper function to check storage bucket access
export async function checkStorageBucket(bucketName = "dispensary-images") {
  try {
    const client = getBrowserClient()
    // Simply try to list files in the bucket
    const { error } = await client.storage.from(bucketName).list("", { limit: 1 })
    return { exists: !error, accessible: !error, error: error?.message }
  } catch (err) {
    console.error("Error checking storage bucket:", err)
    return { exists: false, error: err.message }
  }
}
