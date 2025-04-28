export interface StreetFeature {
  type: "Feature"
  geometry: {
    type: "LineString"
    coordinates: number[][]
  }
  properties: {
    name: string
    type: string
  }
}

export interface StreetCollection {
  type: "FeatureCollection"
  features: StreetFeature[]
}

// Simplified NYC street data
const nycStreets: StreetCollection = {
  type: "FeatureCollection",
  features: [
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.006, 40.7128],
          [-73.9352, 40.7306],
        ],
      },
      properties: {
        name: "Broadway",
        type: "primary",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-73.9812, 40.7588],
          [-73.9738, 40.7614],
        ],
      },
      properties: {
        name: "5th Avenue",
        type: "secondary",
      },
    },
    {
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: [
          [-74.0138, 40.7033],
          [-73.9949, 40.7509],
        ],
      },
      properties: {
        name: "West Street",
        type: "tertiary",
      },
    },
  ],
}

export function getNYCStreets(): Promise<StreetCollection> {
  return Promise.resolve(nycStreets)
}
