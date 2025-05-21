import { supabase } from "@/utils/supabase"

// Simple function to upload a file to the banner-images bucket
export async function uploadToBannerImages(file: File, fileName?: string) {
  try {
    // Generate a unique filename if not provided
    const actualFileName =
      fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split(".").pop()}`

    // Upload the file directly to the existing bucket
    const { data, error } = await supabase.storage.from("banner-images").upload(actualFileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("banner-images").getPublicUrl(actualFileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Simple function to delete a file from the banner-images bucket
export async function deleteFromBannerImages(filePath: string) {
  try {
    // Extract just the filename if a full URL was provided
    const fileName = filePath.includes("/") ? filePath.split("/").pop() : filePath

    if (!fileName) {
      throw new Error("Invalid file path")
    }

    const { error } = await supabase.storage.from("banner-images").remove([fileName])

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

// Function to upload to dispensary-images bucket
export async function uploadToDispensaryImages(file: File, fileName?: string) {
  try {
    // Generate a unique filename if not provided
    const actualFileName =
      fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split(".").pop()}`

    // Upload the file directly to the existing bucket
    const { data, error } = await supabase.storage.from("dispensary-images").upload(actualFileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("dispensary-images").getPublicUrl(actualFileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Function to delete from dispensary-images bucket
export async function deleteFromDispensaryImages(filePath: string) {
  try {
    // Extract just the filename if a full URL was provided
    const fileName = filePath.includes("/") ? filePath.split("/").pop() : filePath

    if (!fileName) {
      throw new Error("Invalid file path")
    }

    const { error } = await supabase.storage.from("dispensary-images").remove([fileName])

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

// Function to upload to grid-images bucket
export async function uploadToGridImages(file: File, fileName?: string) {
  try {
    // Generate a unique filename if not provided
    const actualFileName =
      fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split(".").pop()}`

    // Upload the file directly to the existing bucket
    const { data, error } = await supabase.storage.from("grid-images").upload(actualFileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("grid-images").getPublicUrl(actualFileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}

// Function to upload to secondary-grid-images bucket
export async function uploadToSecondaryGridImages(file: File, fileName?: string) {
  try {
    // Generate a unique filename if not provided
    const actualFileName =
      fileName || `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${file.name.split(".").pop()}`

    // Upload the file directly to the existing bucket
    const { data, error } = await supabase.storage.from("secondary-grid-images").upload(actualFileName, file, {
      cacheControl: "3600",
      upsert: true,
    })

    if (error) {
      console.error("Upload error:", error)
      throw error
    }

    // Get the public URL
    const { data: urlData } = supabase.storage.from("secondary-grid-images").getPublicUrl(actualFileName)

    return {
      path: data.path,
      url: urlData.publicUrl,
    }
  } catch (error) {
    console.error("Error uploading file:", error)
    throw error
  }
}
