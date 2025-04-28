"use client"

import type React from "react"
import { useState } from "react"
import type { Store } from "@/types/store"

interface AdminPanelProps {
  stores: Store[]
  setStores: React.Dispatch<React.SetStateAction<Store[]>>
}

export default function AdminPanel({ stores, setStores }: AdminPanelProps) {
  const [newStore, setNewStore] = useState<Omit<Store, "id">>({
    name: "",
    lat: 0,
    lng: 0,
    address: "",
    image: "",
  })

  const handleAddStore = () => {
    setStores([...stores, { ...newStore, id: Date.now().toString() }])
    setNewStore({ name: "", lat: 0, lng: 0, address: "", image: "" })
  }

  const handleRemoveStore = (id: string) => {
    setStores(stores.filter((store) => store.id !== id))
  }

  return (
    <div className="absolute top-12 right-2 z-[1000] bg-white p-4 rounded shadow max-w-md w-full">
      <h2 className="text-lg font-bold mb-4">Admin Panel</h2>
      <div className="space-y-2">
        <input
          type="text"
          placeholder="Store Name"
          value={newStore.name}
          onChange={(e) => setNewStore({ ...newStore, name: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Latitude"
          value={newStore.lat || ""}
          onChange={(e) => setNewStore({ ...newStore, lat: Number.parseFloat(e.target.value) })}
          className="w-full p-2 border rounded"
        />
        <input
          type="number"
          placeholder="Longitude"
          value={newStore.lng || ""}
          onChange={(e) => setNewStore({ ...newStore, lng: Number.parseFloat(e.target.value) })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Address"
          value={newStore.address}
          onChange={(e) => setNewStore({ ...newStore, address: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newStore.image}
          onChange={(e) => setNewStore({ ...newStore, image: e.target.value })}
          className="w-full p-2 border rounded"
        />
        <button
          onClick={handleAddStore}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 button-hover"
        >
          Add Store
        </button>
      </div>
      <div className="mt-4">
        <h3 className="font-bold mb-2">Existing Stores:</h3>
        <ul className="space-y-2">
          {stores.map((store) => (
            <li key={store.id} className="flex justify-between items-center">
              <span>{store.name}</span>
              <button
                onClick={() => handleRemoveStore(store.id)}
                className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 button-hover"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
