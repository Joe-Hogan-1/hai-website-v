// This file is deprecated - use lib/supabase-client.ts instead
// Keeping this file for backward compatibility

import { getBrowserClient, checkSupabaseConnection, checkStorageBucket } from "@/lib/supabase-client"

// Re-export the singleton client for backward compatibility
export const supabaseBrowser = getBrowserClient()

// Re-export helper functions
export { checkSupabaseConnection, checkStorageBucket }
