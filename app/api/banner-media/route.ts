import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

// Create a Supabase client for server-side use
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

export async function GET() {
  try {
    // Fetch from banner_media table
    const { data, error } = await supabase
      .from("banner_media")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true })

    if (error) {
      console.error("Error fetching banner media:", error)
      return NextResponse.json({ error: `Failed to fetch banner media: ${error.message}` }, { status: 500 })
    }

    // Return the data
    return NextResponse.json(data || [], { status: 200 })
  } catch (error: any) {
    console.error("Unexpected error in banner media API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
