"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, Popup, useMapEvents, ZoomControl } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import type { Store } from "@/types/store"

// Ensure Leaflet uses relative URLs for images
L.Icon.Default.imagePath = "/"

const NYC_CENTER: [number, number] = [40.7128, -74.006]
const NYC_BOUNDS: L.LatLngBoundsExpression = [
  [40.4774, -74.2591],
  [40.9176, -73.7004],
]

function StoreLocationEditor() {
  const [stores, setStores] = useState<Store[]>([])
  const [selectedStore, setSelectedStore] = useState<Store | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isMapLoaded, setIsMapLoaded] = useState(false)

  useEffect(() => {
    // Load stores from local storage or API
    const savedStores = localStorage.getItem("stores")
    if (savedStores) {
      setStores(JSON.parse(savedStores))
    }
  }, [])

  useEffect(() => {
    // Save stores to local storage
    localStorage.setItem("stores", JSON.stringify(stores))
  }, [stores])

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!isEditing) return

    const newStore: Store = {
      id: Date.now().toString(),
      name: "New Store",
      lat: e.latlng.lat,
      lng: e.latlng.lng,
      address: "Address pending...",
      image: "/placeholder.svg?height=150&width=150",
    }

    setStores([...stores, newStore])
    setSelectedStore(newStore)
    setIsEditing(false)
  }

  const handleStoreUpdate = (updatedStore: Store) => {
    setStores(stores.map((store) => (store.id === updatedStore.id ? updatedStore : store)))
    setSelectedStore(null)
  }

  const handleStoreDelete = (storeId: string) => {
    setStores(stores.filter((store) => store.id !== storeId))
    setSelectedStore(null)
  }

  const MapEventHandler = () => {
    useMapEvents({
      click: handleMapClick,
    })
    return null
  }

  return (
    <div className="h-[600px] w-full relative rounded-lg overflow-hidden">
      {!isMapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 z-[1000]">
          <div className="text-2xl font-bold text-white">Loading Map...</div>
        </div>
      )}
      <MapContainer
        center={NYC_CENTER}
        zoom={12}
        scrollWheelZoom={true}
        style={{ height: "100%", width: "100%", position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }}
        zoomControl={false}
        maxBounds={NYC_BOUNDS}
        maxBoundsViscosity={1.0}
        minZoom={11}
        maxZoom={18}
        whenReady={() => setIsMapLoaded(true)}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          subdomains="abcd"
        />
        <ZoomControl position="bottomright" />
        <MapEventHandler />
        {stores.map((store) => (
          <Marker
            key={store.id}
            position={[store.lat, store.lng]}
            eventHandlers={{
              click: () => setSelectedStore(store),
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{store.name}</h3>
                <p>{store.address}</p>
                {store.image && (
                  <img
                    src={store.image || "/placeholder.svg"}
                    alt={store.name}
                    className="w-32 h-32 object-cover mt-2"
                  />
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
      <div className="absolute top-4 right-4 z-[1000] bg-white p-4 rounded shadow">
        <button
          className="bg-blue-500 text-white px-4 py-2 rounded mr-2 button-hover"
          onClick={() => setIsEditing(!isEditing)}
        >
          {isEditing ? "Cancel" : "Add Store"}
        </button>
        {isEditing && <p className="text-sm mt-2">Click on the map to add a new store</p>}
      </div>
      {selectedStore && (
        <StoreEditForm store={selectedStore} onUpdate={handleStoreUpdate} onDelete={handleStoreDelete} />
      )}
    </div>
  )
}

interface StoreEditFormProps {
  store: Store
  onUpdate: (store: Store) => void
  onDelete: (storeId: string) => void
}

function StoreEditForm({ store, onUpdate, onDelete }: StoreEditFormProps) {
  const [name, setName] = useState(store.name)
  const [address, setAddress] = useState(store.address)
  const [image, setImage] = useState(store.image || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate({ ...store, name, address, image })
  }

  return (
    <div className="absolute bottom-4 left-4 z-[1000] bg-white p-4 rounded shadow">
      <form onSubmit={handleSubmit}>
        <div className="mb-2">
          <label htmlFor="name" className="block text-sm font-bold mb-1">
            Name:
          </label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="address" className="block text-sm font-bold mb-1">
            Address:
          </label>
          <input
            type="text"
            id="address"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="mb-2">
          <label htmlFor="image" className="block text-sm font-bold mb-1">
            Image URL:
          </label>
          <input
            type="text"
            id="image"
            value={image}
            onChange={(e) => setImage(e.target.value)}
            className="w-full px-2 py-1 border rounded"
          />
        </div>
        <div className="flex justify-between">
          <button type="submit" className="bg-green-500 text-white px-4 py-2 rounded button-hover">
            Update
          </button>
          <button
            type="button"
            onClick={() => onDelete(store.id)}
            className="bg-red-500 text-white px-4 py-2 rounded button-hover"
          >
            Delete
          </button>
        </div>
      </form>
    </div>
  )
}

export default StoreLocationEditor
