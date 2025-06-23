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

    const { data, error } = await supabase.from("vertical_carousel").update(updateData).eq("id", id).select()

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
