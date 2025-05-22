// This file is deprecated - use lib/supabase-client.ts instead
// Keeping this file for backward compatibility

import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { getServerClient, getDirectServerClient } from "@/lib/supabase-client"

// Original function name for backward compatibility
export function createServerClient() {
  const cookieStore = cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
    },
  })
}

// Server-side Supabase client with full functionality
export const createServerSupabase = getServerClient

// Direct server-side client for API routes
export const createDirectServerClient = getDirectServerClient
