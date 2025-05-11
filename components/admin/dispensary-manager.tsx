"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, MapPin, Search, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"

interface Dispensary {
  id: string
  name: string
  address: string
  city: string
  state: string
  zip?: string
  lat: number
  lng: number
  phone?: string
  website?: string
  image_url?: string
  has_hai_products: boolean
  featured: boolean
  description?: string
  created_at: string
  updated_at?: string
}

interface DispensaryManagerProps {
  userId?: string
}

export default function DispensaryManager({ userId }: DispensaryManagerProps) {
  const [dispensaries, setDispensaries] = useState<Dispensary[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentDispensary, setCurrentDispensary] = useState<Partial<Dispensary>>({
    name: "",
    address: "",
    city: "",
    state: "NY",
    zip: "",
    lat: 0,
    lng: 0,
    phone: "",
    website: "",
    image_url: "",
    has_hai_products: false,
    featured: false,
    description: "",
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterFeatured, setFilterFeatured] = useState(false)
  const [filterHaiProducts, setFilterHaiProducts] = useState(false)

  useEffect(() => {
    fetchDispensaries()
  }, [])

  const fetchDispensaries = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("dispensaries").select("*").order("name", { ascending: true })

      if (error) {
        console.error("Error fetching dispensaries:", error)
        toast.error("Failed to load dispensaries")
        setDispensaries([])
      } else {
        setDispensaries(data || [])
      }
    } catch (error) {
      console.error("Exception fetching dispensaries:", error)
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
      state: "NY",
      zip: "",
      lat: 0,
      lng: 0,
      phone: "",
      website: "",
      image_url: "",
      has_hai_products: false,
      featured: false,
      description: "",
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
      state: "NY",
      zip: "",
      lat: 0,
      lng: 0,
      phone: "",
      website: "",
      image_url: "",
      has_hai_products: false,
      featured: false,
      description: "",
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
        try {
          const imagePath = dispensary.image_url.split("/").pop()
          if (imagePath) {
            await supabase.storage.from("dispensary-images").remove([imagePath])
          }
        } catch (storageError) {
          console.error("Error deleting image (non-critical):", storageError)
          // Continue even if image deletion fails
        }
      }

      toast.success("Dispensary deleted successfully")
      fetchDispensaries()
    } catch (error) {
      console.error("Error deleting dispensary:", error)
      toast.error("Failed to delete dispensary")
    }
  }

  const handleToggleHaiProducts = async (dispensary: Dispensary) => {
    try {
      const { error } = await supabase
        .from("dispensaries")
        .update({
          has_hai_products: !dispensary.has_hai_products,
        })
        .eq("id", dispensary.id)

      if (error) throw error

      toast.success(
        dispensary.has_hai_products ? "Location no longer carries hai. products" : "Location now carries hai. products",
      )

      // Update the local state
      setDispensaries(
        dispensaries.map((d) => (d.id === dispensary.id ? { ...d, has_hai_products: !d.has_hai_products } : d)),
      )
    } catch (error) {
      console.error("Error toggling hai products:", error)
      toast.error("Failed to update hai. products status")
    }
  }

  const handleToggleFeatured = async (dispensary: Dispensary) => {
    try {
      const { error } = await supabase
        .from("dispensaries")
        .update({
          featured: !dispensary.featured,
        })
        .eq("id", dispensary.id)

      if (error) throw error

      toast.success(dispensary.featured ? "Dispensary removed from featured" : "Dispensary added to featured")

      // Update the local state
      setDispensaries(dispensaries.map((d) => (d.id === dispensary.id ? { ...d, featured: !d.featured } : d)))
    } catch (error) {
      console.error("Error toggling featured status:", error)
      toast.error("Failed to update featured status")
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
        try {
          // Generate a simple filename
          const fileExt = imageFile.name.split(".").pop()
          const fileName = `${Date.now()}.${fileExt}`

          console.log("Attempting to upload file:", fileName)

          // Try the upload with detailed error logging
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("dispensary-images")
            .upload(fileName, imageFile, {
              cacheControl: "3600",
              upsert: true,
              onUploadProgress: (progress) => {
                setUploadProgress((progress.loaded / progress.total) * 100)
              },
            })

          if (uploadError) {
            console.error("Upload error details:", uploadError)
            throw new Error(`Upload failed: ${uploadError.message}`)
          }

          console.log("Upload successful:", uploadData)

          // Get the URL
          const { data: urlData } = supabase.storage.from("dispensary-images").getPublicUrl(fileName)
          imageUrl = urlData.publicUrl

          console.log("Generated public URL:", imageUrl)
        } catch (uploadError) {
          console.error("Image upload error:", uploadError)
          toast.error(`Image upload failed: ${uploadError.message}. Continuing without image.`)
          // Continue without the image
        }
      }

      // Prepare dispensary data
      const dispensaryData = {
        name: currentDispensary.name,
        address: currentDispensary.address,
        city: currentDispensary.city,
        state: currentDispensary.state || "NY",
        zip: currentDispensary.zip || null,
        lat: currentDispensary.lat,
        lng: currentDispensary.lng,
        phone: currentDispensary.phone || null,
        website: currentDispensary.website || null,
        has_hai_products: currentDispensary.has_hai_products || false,
        featured: currentDispensary.featured || false,
        description: currentDispensary.description || null,
        image_url: imageUrl,
      }

      console.log("Saving dispensary data:", dispensaryData)

      if (currentDispensary.id) {
        // Update existing dispensary
        const { error } = await supabase.from("dispensaries").update(dispensaryData).eq("id", currentDispensary.id)

        if (error) {
          console.error("Update error:", error)
          throw error
        }
        toast.success("Dispensary updated successfully")
      } else {
        // Create new dispensary
        const { error, data } = await supabase.from("dispensaries").insert(dispensaryData).select()

        if (error) {
          console.error("Insert error:", error)
          throw error
        }

        console.log("Created dispensary:", data)
        toast.success("Dispensary created successfully")
      }

      setIsEditing(false)
      fetchDispensaries()
      setCurrentDispensary({
        name: "",
        address: "",
        city: "",
        state: "NY",
        zip: "",
        lat: 0,
        lng: 0,
        phone: "",
        website: "",
        image_url: "",
        has_hai_products: false,
        featured: false,
        description: "",
      })
      setImageFile(null)
    } catch (error) {
      console.error("Error saving dispensary:", error)
      toast.error(`Failed to save dispensary: ${error.message}`)
    }
  }

  // Function to geocode an address
  const geocodeAddress = async () => {
    if (!currentDispensary.address || !currentDispensary.city) {
      toast.error("Please enter an address and city")
      return
    }

    try {
      const address = `${currentDispensary.address}, ${currentDispensary.city}, ${currentDispensary.state || "NY"}`
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
      console.error("Error geocoding address:", error)
      toast.error("Error finding coordinates")
    }
  }

  // Apply filters
  let filteredDispensaries = [...dispensaries]

  // Apply search filter
  if (searchTerm) {
    filteredDispensaries = filteredDispensaries.filter(
      (dispensary) =>
        dispensary.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispensary.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispensary.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dispensary.description?.toLowerCase().includes(searchTerm.toLowerCase()),
    )
  }

  // Apply featured filter
  if (filterFeatured) {
    filteredDispensaries = filteredDispensaries.filter((dispensary) => dispensary.featured)
  }

  // Apply hai products filter
  if (filterHaiProducts) {
    filteredDispensaries = filteredDispensaries.filter((dispensary) => dispensary.has_hai_products)
  }

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

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-1">
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
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                    State
                  </label>
                  <Input
                    id="state"
                    value={currentDispensary.state || "NY"}
                    onChange={(e) => setCurrentDispensary({ ...currentDispensary, state: e.target.value })}
                    placeholder="State"
                  />
                </div>
                <div>
                  <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                    ZIP
                  </label>
                  <Input
                    id="zip"
                    value={currentDispensary.zip || ""}
                    onChange={(e) => setCurrentDispensary({ ...currentDispensary, zip: e.target.value })}
                    placeholder="ZIP Code"
                  />
                </div>
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

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <Textarea
                  id="description"
                  value={currentDispensary.description || ""}
                  onChange={(e) => setCurrentDispensary({ ...currentDispensary, description: e.target.value })}
                  placeholder="Enter a description of this dispensary"
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="has-hai-products"
                    checked={currentDispensary.has_hai_products || false}
                    onCheckedChange={(checked) =>
                      setCurrentDispensary({ ...currentDispensary, has_hai_products: checked })
                    }
                  />
                  <label htmlFor="has-hai-products" className="text-sm font-medium text-gray-700">
                    Carries hai. products
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="featured"
                    checked={currentDispensary.featured || false}
                    onCheckedChange={(checked) => setCurrentDispensary({ ...currentDispensary, featured: checked })}
                  />
                  <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center">
                    Featured <Star className="ml-1 h-4 w-4 text-yellow-400" />
                  </label>
                </div>
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
              <div className="mb-6 space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
                  <Input
                    placeholder="Search dispensaries by name, city, or address..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`cursor-pointer ${filterFeatured ? "bg-yellow-400 text-black" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => setFilterFeatured(!filterFeatured)}
                  >
                    <Star className={`h-3 w-3 mr-1 ${filterFeatured ? "fill-black" : ""}`} />
                    Featured
                  </Badge>
                  <Badge
                    className={`cursor-pointer ${filterHaiProducts ? "bg-[#ffd6c0]" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => setFilterHaiProducts(!filterHaiProducts)}
                  >
                    Carries hai. products
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDispensaries.map((dispensary) => (
                  <Card key={dispensary.id} className="overflow-hidden h-full flex flex-col">
                    <CardContent className="p-0 flex flex-col h-full">
                      {dispensary.image_url && (
                        <div className="relative h-48">
                          <img
                            src={dispensary.image_url || "/placeholder.svg?height=200&width=300"}
                            alt={dispensary.name}
                            className="w-full h-full object-cover"
                          />
                          {dispensary.featured && (
                            <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                              <Star className="h-3 w-3 mr-1" /> Featured
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold">{dispensary.name}</h3>
                          <p className="text-gray-600 text-sm">{dispensary.address}</p>
                          <p className="text-gray-600 text-sm">
                            {dispensary.city}, {dispensary.state} {dispensary.zip}
                          </p>
                        </div>

                        {dispensary.description && (
                          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{dispensary.description}</p>
                        )}

                        <div className="mt-auto">
                          {dispensary.phone && <p className="text-gray-600 text-sm">{dispensary.phone}</p>}

                          {dispensary.website && (
                            <p className="text-gray-600 text-sm">
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

                          <div className="flex flex-col space-y-2 mt-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center">
                                <Switch
                                  id={`hai-products-${dispensary.id}`}
                                  checked={dispensary.has_hai_products}
                                  onCheckedChange={() => handleToggleHaiProducts(dispensary)}
                                  className="mr-2"
                                />
                                <label htmlFor={`hai-products-${dispensary.id}`} className="text-xs">
                                  hai. products
                                </label>
                              </div>

                              <Button
                                variant="outline"
                                size="sm"
                                className={`text-xs ${dispensary.featured ? "text-yellow-600" : "text-gray-500"}`}
                                onClick={() => handleToggleFeatured(dispensary)}
                              >
                                <Star className={`h-3 w-3 mr-1 ${dispensary.featured ? "fill-yellow-400" : ""}`} />
                                {dispensary.featured ? "Featured" : "Feature"}
                              </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center"
                                onClick={() => handleEdit(dispensary)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Edit
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="w-full justify-center text-red-500 hover:text-red-700"
                                onClick={() => handleDelete(dispensary.id)}
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Delete
                              </Button>
                            </div>
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
