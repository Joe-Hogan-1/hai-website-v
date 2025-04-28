import type { Store } from "@/types/store"

export async function verifyDispensaries(stores: Store[]): Promise<Store[]> {
  const verifiedStores: Store[] = []

  for (const store of stores) {
    try {
      const query = `${store.name} ${store.address} legal cannabis dispensary new york`
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query)}`

      // Note: This is a simplified example. In a real-world scenario, you'd need to use a proper web scraping library or Google's Custom Search API.
      const response = await fetch(searchUrl)
      const html = await response.text()

      // Check if the search results contain keywords indicating a legal dispensary
      const isLegal =
        html.toLowerCase().includes("licensed") ||
        html.toLowerCase().includes("legal dispensary") ||
        html.toLowerCase().includes("ocm approved")

      if (isLegal) {
        verifiedStores.push(store)
      }
    } catch (error) {
      // Error verifying store
    }
  }

  return verifiedStores
}
