import type { Store } from "@/types/store"

const OVERPASS_API_URL = "https://overpass-api.de/api/interpreter"

export async function getNYLegalDispensaries(): Promise<Store[]> {
  const query = `
    [out:json];
    area["name"="New York"]["admin_level"="4"]->.ny;
    (
      node["shop"="cannabis"]["legal"="yes"](area.ny);
      node["amenity"="dispensary"]["legal"="yes"](area.ny);
      node["shop"="cannabis"]["name"~"Legal|OCM|Licensed|Safe|CAURD",i](area.ny);
      node["amenity"="dispensary"]["name"~"Legal|OCM|Licensed|Safe|CAURD",i](area.ny);
    );
    out body;
  `

  try {
    const response = await fetch(OVERPASS_API_URL, {
      method: "POST",
      body: `data=${encodeURIComponent(query)}`,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }

    const data = await response.json()

    return data.elements.map((element: any) => ({
      id: element.id.toString(),
      name: element.tags.name || "Unnamed Legal Dispensary",
      lat: element.lat,
      lng: element.lon,
      address:
        element.tags["addr:full"] ||
        element.tags["addr:housenumber"] + " " + element.tags["addr:street"] ||
        "Address not available",
      image: element.tags.image || "/placeholder.svg?height=150&width=150",
    }))
  } catch (error) {
    return []
  }
}
