import { supabase } from "@/utils/supabase"

// Upload a file to the photo-grid bucket
export async function uploadToPhotoGrid(file: File, fileName?: string) {
  try {
    // First, try to fix the bucket permissions
    try {
      await supabase.rpc("fix_photo_grid_bucket")
    } catch (error) {
      console.error("Error fixing photo-grid bucket:", error)
    }

    // Generate a unique filename if not provided
    const actualFileName =
      fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split(".").pop()}`

    // Upload the file
    const { data, error } = await supabase.storage.from("photo-grid").upload(actualFileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("photo-grid").getPublicUrl(actualFileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Delete a file from the photo-grid bucket
export async function deleteFromPhotoGrid(filePath: string) {
  try {
    // Extract just the filename if a full URL was provided
    const fileName = filePath.includes("/") ? filePath.split("/").pop() : filePath

    if (!fileName) {
      throw new Error("Invalid file path")
    }

    const { error } = await supabase.storage.from("photo-grid").remove([fileName])

    if (error) {
      console.error("Delete error:", error)
      throw error
    }

    return true
  } catch (error) {
    console.error("Error deleting file:", error)
    throw error
  }
}
