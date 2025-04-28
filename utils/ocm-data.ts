import type { Store } from "@/types/store"
import { JSDOM } from "jsdom"

const OCM_URL = "https://cannabis.ny.gov/dispensary-location-verification"

export async function getOCMLicensedDispensaries(): Promise<Store[]> {
  try {
    const response = await fetch(OCM_URL)
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    const html = await response.text()
    const dom = new JSDOM(html)
    const document = dom.window.document

    const dispensaries: Store[] = []
    const dispensaryElements = document.querySelectorAll(".dispensary-item")

    dispensaryElements.forEach((element, index) => {
      const name = element.querySelector(".dispensary-name")?.textContent?.trim() || "Unnamed Dispensary"
      const address = element.querySelector(".dispensary-address")?.textContent?.trim() || "Address not available"

      // Note: Actual latitude and longitude might not be available on the page.
      // You may need to use a geocoding service to get these coordinates based on the address.
      const lat = 0 // placeholder
      const lng = 0 // placeholder

      dispensaries.push({
        id: `ocm-${index}`,
        name,
        lat,
        lng,
        address,
        image: "/placeholder.svg?height=150&width=150",
        licenseType: "Adult-Use", // Assuming all are adult-use based on the page content
      })
    })

    return dispensaries
  } catch (error) {
    return []
  }
}
