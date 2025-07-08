import { NextResponse } from "next/server"
import { createDirectServerClient } from "@/utils/supabase-server"

export async function GET() {
  const supabase = createDirectServerClient()
  try {
    const { data, error } = await supabase.from("vertical_carousel").select("*").order("position")

    if (error) {
      console.error("Error fetching vertical carousel data:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const supabase = createDirectServerClient()
  try {
    const body = await request.json()

    const { data, error } = await supabase.from("vertical_carousel").insert(body).select()

    if (error) {
      console.error("Error adding vertical carousel item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  const supabase = createDirectServerClient()
  try {
    const body = await request.json()
    const { id, ...updateData } = body

    // Ensure all fields are properly handled
    const cleanUpdateData = {
      image_url: updateData.image_url,
      title: updateData.title || null,
      description: updateData.description || null,
      link_url: updateData.link_url || null,
      link_text: updateData.link_text || null,
      position: updateData.position !== undefined ? updateData.position : 0,
    }

    const { data, error } = await supabase.from("vertical_carousel").update(cleanUpdateData).eq("id", id).select()

    if (error) {
      console.error("Error updating vertical carousel item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  const supabase = createDirectServerClient()
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "ID is required" }, { status: 400 })
    }

    const { error } = await supabase.from("vertical_carousel").delete().eq("id", id)

    if (error) {
      console.error("Error deleting vertical carousel item:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
