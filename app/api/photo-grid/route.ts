import { NextResponse } from "next/server"
import { createDirectServerClient } from "@/utils/supabase-server"

export async function GET() {
  try {
    const supabase = createDirectServerClient()

    // First try to fetch from photo_grid table
    const { data, error } = await supabase
      .from("photo_grid")
      .select("*")
      .order("position", { ascending: true })
      .limit(4)

    if (error) {
      console.error("Error fetching from photo_grid:", error)

      // Create default images instead of trying to fetch from a non-existent table
      const defaultImages = Array.from({ length: 4 }, (_, i) => ({
        id: `default-${i}`,
        image_url: `/placeholder.svg?height=300&width=300&query=product+image+${i + 1}`,
        position: i,
        title: "Product Category",
        description: "Explore our products",
        link_url: "/products",
        link_text: "Shop Now",
        created_at: new Date().toISOString(),
      }))

      return NextResponse.json(defaultImages)
    }

    return NextResponse.json(data)
  } catch (err: any) {
    console.error("Unexpected error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
