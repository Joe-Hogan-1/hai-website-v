import { NextResponse } from "next/server"
import { createDirectServerClient } from "@/utils/supabase-server"

export async function GET() {
  try {
    const supabase = createDirectServerClient()

    const { data, error } = await supabase
      .from("breaking_news")
      .select("*")
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== "PGRST116") {
      console.error("Error fetching breaking news:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // If no data or PGRST116 (no rows returned), return empty object
    if (!data) {
      return NextResponse.json({})
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = createDirectServerClient()
    const body = await request.json()
    const { id, text, is_active } = body

    if (text === undefined) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 })
    }

    const newsText = text.trim()
    const isActive = is_active !== false // Default to true if not explicitly set to false

    let result

    if (id) {
      // Update existing news
      const { data, error } = await supabase
        .from("breaking_news")
        .update({
          text: newsText,
          is_active: isActive,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select()

      if (error) {
        console.error("Error updating breaking news:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
    } else if (isActive) {
      // Create new news
      const { data, error } = await supabase
        .from("breaking_news")
        .insert({
          text: newsText,
          is_active: true,
        })
        .select()

      if (error) {
        console.error("Error creating breaking news:", error)
        return NextResponse.json({ error: error.message }, { status: 500 })
      }

      result = data?.[0]
    } else {
      // No text provided or is_active is false, and no id to update
      return NextResponse.json({ message: "No action needed" })
    }

    return NextResponse.json(result || {})
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
