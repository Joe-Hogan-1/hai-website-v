import { NextResponse } from "next/server"
import { createDirectServerClient } from "@/utils/supabase-server"

export async function GET(request: Request) {
  try {
    const supabase = createDirectServerClient()
    const url = new URL(request.url)
    const key = url.searchParams.get("key")

    if (!key) {
      // Get all settings
      const { data, error } = await supabase.from("site_settings").select("*")

      if (error) {
        console.error("Error fetching site settings:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      return NextResponse.json(data)
    } else {
      // Get specific setting
      const { data, error } = await supabase.from("site_settings").select("*").eq("key", key).single()

      if (error && error.code !== "PGRST116") {
        console.error(`Error fetching site setting '${key}':`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      if (!data) {
        return NextResponse.json({ key, value: null })
      }

      return NextResponse.json(data)
    }
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createDirectServerClient()
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json({ error: "Key is required" }, { status: 400 })
    }

    console.log("Received site setting update:", { key, value })

    // Check if setting exists
    const { data: existingData, error: checkError } = await supabase
      .from("site_settings")
      .select("*")
      .eq("key", key)
      .single()

    let result

    if (checkError && checkError.code !== "PGRST116") {
      console.error(`Error checking site setting '${key}':`, checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingData) {
      // Update existing setting
      console.log(`Updating existing setting for '${key}'`, value)
      const { data, error } = await supabase.from("site_settings").update({ value }).eq("key", key).select()

      if (error) {
        console.error(`Error updating site setting '${key}':`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
      console.log(`Successfully updated setting for '${key}'`, result)
    } else {
      // Create new setting
      console.log(`Creating new setting for '${key}'`, value)
      const { data, error } = await supabase.from("site_settings").insert({ key, value }).select()

      if (error) {
        console.error(`Error creating site setting '${key}':`, error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
      console.log(`Successfully created setting for '${key}'`, result)
    }

    return NextResponse.json(result || {})
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
