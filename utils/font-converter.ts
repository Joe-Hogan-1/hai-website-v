/**
 * Font Converter Utility
 *
 * This utility helps with font conversion for better browser compatibility.
 * Since we're using a webp font file, we need to ensure it's properly handled.
 *
 * Note: In a production environment, you would typically convert the webp font
 * to standard web font formats (woff2, woff, ttf) during the build process.
 */

export async function convertWebpFont() {
  // In a real implementation, this would convert the webp font to standard web formats
  // For now, this is a placeholder for the actual conversion logic
  console.log("Font conversion utility initialized")

  // Check if the browser supports webp fonts
  const supportsWebp = () => {
    const elem = document.createElement("canvas")
    if (elem.getContext && elem.getContext("2d")) {
      return elem.toDataURL("image/webp").indexOf("data:image/webp") === 0
    }
    return false
  }

  // Log webp support status
  if (typeof window !== "undefined") {
    console.log(`Browser ${supportsWebp() ? "supports" : "does not support"} webp`)
  }

  return {
    supportsWebp: typeof window !== "undefined" ? supportsWebp() : false,
  }
}
