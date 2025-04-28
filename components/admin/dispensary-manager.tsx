"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, MapPin, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"

interface Dispensary {
  id: string
  name: string
  address: string
  city: string
  lat: number
  lng: number
  phone?: string
  website?: string
  image_url?: string
  has_hai_products: boolean
  created_at: string
  user_id: string
}

interface DispensaryManagerProps {
  userId: string
}

export default function DispensaryManager({ userId }: DispensaryManagerProps) {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDispensary, setCurrentDispensary] = useState<Partial<Dispensary>>({
    name: "",
    address: "",
    city: "",
    lat: 0,
    lng: 0,
    phone: "",
    website: "",
    image_url: "",
    has_hai_products: true,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDispensaries()
  }, [])

  const fetchDispensaries = async () => {
    try {
      setLoading(true)

      // Try to fetch from Supabase
      const { data, error } = await supabase.from("dispensaries").select("*").order("name", { ascending: true })

      if (error) {
        // If the table doesn't exist, show a helpful message
        if (error.message.includes("does not exist")) {
          setError("The dispensaries table doesn't exist in your database yet. Please create it first.")
          setDispensaries([])
        } else {
          toast.error("Failed to load dispensaries")
          setDispensaries([])
        }
      } else {
        setDispensaries(data || [])
      }
    } catch (error) {
      toast.error("Failed to load dispensaries")
      setDispensaries([])
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentDispensary({
      name: "",
      address: "",
      city: "",
      lat: 0,
      lng: 0,
      phone: "",
      website: "",
      image_url: "",
      has_hai_products: true,
    })
    setImageFile(null)
    setIsEditing(true)
  }

  const handleEdit = (dispensary: Dispensary) => {
    setCurrentDispensary(dispensary)
    setImageFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentDispensary({
      name: "",
      address: "",
      city: "",
      lat: 0,
      lng: 0,
      phone: "",
      website: "",
      image_url: "",
      has_hai_products: true,
    })
    setImageFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this dispensary?")) return

    try {
      // First, get the dispensary to check if it has an image
      const { data: dispensary } = await supabase.from("dispensaries").select("image_url").eq("id", id).single()

      // Delete the dispensary
      const { error } = await supabase.from("dispensaries").delete().eq("id", id)

      if (error) throw error

      // If there was an image, delete it from storage
      if (dispensary?.image_url) {
        const imagePath = dispensary.image_url.split("/").pop()
        if (imagePath) {
          await supabase.storage.from("dispensary-images").remove([imagePath])
        }
      }

      toast.success("Dispensary deleted successfully")
      fetchDispensaries()
    } catch (error) {
      toast.error("Failed to delete dispensary")
    }
  }

  const handleToggleHaiProducts = async (dispensary: Dispensary) => {
    try {
      const { error } = await supabase
        .from("dispensaries")
        .update({
          has_hai_products: !dispensary.has_hai_products,
          updated_at: new Date().toISOString(),
        })
        .eq("id", dispensary.id)
        .eq("user_id", userId)

      if (error) throw error

      toast.success(
        dispensary.has_hai_products ? "Location no longer carries hai. products" : "Location now carries hai. products",
      )

      // Update the local state
      setDispensaries(
        dispensaries.map((d) => (d.id === dispensary.id ? { ...d, has_hai_products: !d.has_hai_products } : d)),
      )
    } catch (error) {
      toast.error("Failed to update hai. products status")
    }
  }

  const handleSave = async () => {
    try {
      if (!currentDispensary.name || !currentDispensary.address || !currentDispensary.city) {
        toast.error("Name, address, and city are required")
        return
      }

      if (currentDispensary.lat === 0 && currentDispensary.lng === 0) {
        toast.error("Please provide valid coordinates")
        return
      }

      let imageUrl = currentDispensary.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError, data } = await supabase.storage
          .from("dispensary-images")
          .upload(filePath, imageFile, {
            cacheControl: "3600",
            upsert: false,
            onUploadProgress: (progress) => {
              setUploadProgress((progress.loaded / progress.total) * 100)
            },
          })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: urlData } = supabase.storage.from("dispensary-images").getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      if (currentDispensary.id) {
        // Update existing dispensary
        const { error } = await supabase
          .from("dispensaries")
          .update({
            name: currentDispensary.name,
            address: currentDispensary.address,
            city: currentDispensary.city,
            lat: currentDispensary.lat,
            lng: currentDispensary.lng,
            phone: currentDispensary.phone,
            website: currentDispensary.website,
            image_url: imageUrl,
            has_hai_products: currentDispensary.has_hai_products,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentDispensary.id)
          .eq("user_id", userId) // Ensure user can only update their own dispensaries

        if (error) throw error
        toast.success("Dispensary updated successfully")
      } else {
        // Create new dispensary
        const { error } = await supabase.from("dispensaries").insert({
          name: currentDispensary.name,
          address: currentDispensary.address,
          city: currentDispensary.city,
          lat: currentDispensary.lat,
          lng: currentDispensary.lng,
          phone: currentDispensary.phone,
          website: currentDispensary.website,
          image_url: imageUrl,
          has_hai_products: currentDispensary.has_hai_products,
          user_id: userId,
        })

        if (error) throw error
        toast.success("Dispensary created successfully")
      }

      setIsEditing(false)
      fetchDispensaries()
      setCurrentDispensary({
        name: "",
        address: "",
        city: "",
        lat: 0,
        lng: 0,
        phone: "",
        website: "",
        image_url: "",
        has_hai_products: true,
      })
      setImageFile(null)
    } catch (error) {
      toast.error("Failed to save dispensary")
    }
  }

  // Function to geocode an address
  const geocodeAddress = async () => {
    if (!currentDispensary.address || !currentDispensary.city) {
      toast.error("Please enter an address and city")
      return
    }

    try {
      const address = `${currentDispensary.address}, ${currentDispensary.city}, NY`
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
      )
      const data = await response.json()

      if (data && data.length > 0) {
        setCurrentDispensary({
          ...currentDispensary,
          lat: Number.parseFloat(data[0].lat),
          lng: Number.parseFloat(data[0].lon),
        })
        toast.success("Coordinates found")
      } else {
        toast.error("Could not find coordinates for this address")
      }
    } catch (error) {
      toast.error("Error finding coordinates")
    }
  }

  const filteredDispensaries = dispensaries.filter(
    (dispensary) =>
      dispensary.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispensary.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      dispensary.address.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return <div className="text-center py-8">Loading dispensaries...</div>
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Dispensary Locations</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Dispensary
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentDispensary.id ? "Edit Dispensary" : "Add New Dispensary"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-5">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                  Dispensary Name*
                </label>
                <Input
                  id="name"
                  value={currentDispensary.name || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, name: e.target.value })}
                  placeholder="Enter dispensary name"
                  required
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-2">
                  Address*
                </label>
                <Input
                  id="address"
                  value={currentDispensary.address || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, address: e.target.value })}
                  placeholder="Street address"
                  required
                />
              </div>

              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                  City*
                </label>
                <Input
                  id="city"
                  value={currentDispensary.city || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, city: e.target.value })}
                  placeholder="City"
                  required
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  value={currentDispensary.phone || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, phone: e.target.value })}
                  placeholder="Phone number"
                />
              </div>

              <div>
                <label htmlFor="website" className="block text-sm font-medium text-gray-700 mb-2">
                  Website
                </label>
                <Input
                  id="website"
                  value={currentDispensary.website || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, website: e.target.value })}
                  placeholder="Website URL"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="has-hai-products"
                  checked={currentDispensary.has_hai_products || false}
                  onCheckedChange={(checked) =>
                    setCurrentDispensary({ ...currentDispensary, has_hai_products: checked })
                  }
                />
                <Label htmlFor="has-hai-products" className="font-medium">
                  Location carries hai. products
                </Label>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Coordinates*</label>
                  <Button variant="outline" size="sm" onClick={geocodeAddress} className="text-xs">
                    <MapPin className="h-3 w-3 mr-1" /> Find Coordinates
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Input
                      type="number"
                      step="any"
                      value={currentDispensary.lat || ""}
                      onChange={(e) =>
                        setCurrentDispensary({ ...currentDispensary, lat: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Latitude"
                      required
                    />
                  </div>
                  <div>
                    <Input
                      type="number"
                      step="any"
                      value={currentDispensary.lng || ""}
                      onChange={(e) =>
                        setCurrentDispensary({ ...currentDispensary, lng: Number.parseFloat(e.target.value) })
                      }
                      placeholder="Longitude"
                      required
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Enter coordinates or use the "Find Coordinates" button to automatically locate based on address.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Dispensary Image</label>
                <ImageUploader
                  existingImageUrl={currentDispensary.image_url}
                  onImageSelected={setImageFile}
                  uploadProgress={uploadProgress}
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6">
            <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
              <Save className="mr-2 h-4 w-4" /> Save Dispensary
            </Button>
          </div>
        </div>
      ) : (
        <>
          {dispensaries.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No dispensaries added yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Dispensary
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                <Input
                  placeholder="Search dispensaries by name, city, or address..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <div className="space-y-4">
                {filteredDispensaries.map((dispensary) => (
                  <Card key={dispensary.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="flex flex-col md:flex-row">
                        {dispensary.image_url && (
                          <div className="w-full md:w-1/4 h-48 md:h-auto">
                            <img
                              src={dispensary.image_url || "/placeholder.svg"}
                              alt={dispensary.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                        )}
                        <div className="p-6 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="text-xl font-semibold mb-1">{dispensary.name}</h3>
                              <p className="text-gray-600">{dispensary.address}</p>
                              <p className="text-gray-600">{dispensary.city}, NY</p>

                              {dispensary.phone && <p className="text-gray-600 mt-2">{dispensary.phone}</p>}

                              {dispensary.website && (
                                <p className="text-gray-600 mt-1">
                                  <a
                                    href={dispensary.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#a8d1e7] hover:underline"
                                  >
                                    Website
                                  </a>
                                </p>
                              )}
                            </div>

                            <div className="flex flex-col items-end space-y-2">
                              <div className="flex items-center">
                                <Switch
                                  id={`hai-products-${dispensary.id}`}
                                  checked={dispensary.has_hai_products}
                                  onCheckedChange={() => handleToggleHaiProducts(dispensary)}
                                  className="mr-2"
                                />
                                <Label htmlFor={`hai-products-${dispensary.id}`} className="text-sm">
                                  hai. products
                                </Label>
                              </div>
                            </div>
                          </div>

                          <div className="flex justify-end space-x-2 mt-4">
                            <Button variant="outline" size="sm" onClick={() => handleEdit(dispensary)}>
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(dispensary.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-1" /> Delete
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
