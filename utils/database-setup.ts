import { supabase } from "./supabase"

export async function setupDatabase() {
  try {
    console.log("Checking database tables...")

    // Check if tables exist
    const { data: tablesData, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public")

    if (tablesError) {
      console.error("Error checking tables:", tablesError)
      return false
    }

    const existingTables = tablesData?.map((t) => t.table_name) || []

    // List of required tables
    const requiredTables = [
      "blog_posts",
      "products",
      "product_categories",
      "dispensaries",
      "banner_videos",
      "banner_media",
      "grid_images",
      "newsletter_subscribers",
      "breaking_news",
    ]

    // Check if all required tables exist
    const missingTables = requiredTables.filter((table) => !existingTables.includes(table))

    if (missingTables.length > 0) {
      console.warn("Missing tables:", missingTables)
      return false
    }

    console.log("All required tables exist!")
    return true
  } catch (error) {
    console.error("Database setup check failed:", error)
    return false
  }
}
