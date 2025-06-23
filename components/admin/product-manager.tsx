"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X, Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import ImageUploader from "./image-uploader"
import { Badge } from "@/components/ui/badge"

interface Product {
  id: string
  name: string
  description: string
  image_url: string
  featured: boolean
  category?: "Indica" | "Sativa" | "Hybrid" | null
  product_category?: string | null
  created_at: string
  user_id: string
}

interface ProductManagerProps {
  userId: string
}

export default function ProductManager({ userId }: ProductManagerProps) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentProduct, setCurrentProduct] = useState<Partial<Product>>({
    name: "",
    description: "",
    image_url: "",
    featured: false,
    category: null,
    product_category: null,
  })
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [filterCategory, setFilterCategory] = useState<string | null>(null)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("products").select("*").order("created_at", { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      toast.error("Failed to load products")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentProduct({
      name: "",
      description: "",
      image_url: "",
      featured: false,
      category: null,
      product_category: null,
    })
    setImageFile(null)
    setIsEditing(true)
  }

  const handleEdit = (product: Product) => {
    setCurrentProduct(product)
    setImageFile(null)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentProduct({
      name: "",
      description: "",
      image_url: "",
      featured: false,
      category: null,
      product_category: null,
    })
    setImageFile(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return

    try {
      // First, get the product to check if it has an image
      const { data: product } = await supabase.from("products").select("image_url").eq("id", id).single()

      // Delete the product
      const { error } = await supabase.from("products").delete().eq("id", id)

      if (error) throw error

      // If there was an image, delete it from storage
      if (product?.image_url) {
        const imagePath = product.image_url.split("/").pop()
        if (imagePath) {
          await supabase.storage.from("product-images").remove([imagePath])
        }
      }

      toast.success("Product deleted successfully")
      fetchProducts()
    } catch (error) {
      toast.error("Failed to delete product")
    }
  }

  const handleToggleFeatured = async (product: Product) => {
    try {
      const { error } = await supabase
        .from("products")
        .update({
          featured: !product.featured,
          updated_at: new Date().toISOString(),
        })
        .eq("id", product.id)
        .eq("user_id", userId)

      if (error) throw error

      toast.success(product.featured ? "Product removed from featured" : "Product added to featured")

      // Update the local state
      setProducts(products.map((p) => (p.id === product.id ? { ...p, featured: !p.featured } : p)))
    } catch (error) {
      toast.error("Failed to update featured status")
    }
  }

  const handleSave = async () => {
    try {
      if (!currentProduct.name) {
        toast.error("Name is required")
        return
      }

      let imageUrl = currentProduct.image_url

      // Upload image if a new one is selected
      if (imageFile) {
        const fileExt = imageFile.name.split(".").pop()
        const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage.from("product-images").upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress) => {
            setUploadProgress((progress.loaded / progress.total) * 100)
          },
        })

        if (uploadError) throw uploadError

        // Get the public URL
        const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath)
        imageUrl = urlData.publicUrl
      }

      if (currentProduct.id) {
        // Update existing product
        const { error } = await supabase
          .from("products")
          .update({
            name: currentProduct.name,
            description: currentProduct.description,
            image_url: imageUrl,
            featured: currentProduct.featured,
            category: currentProduct.category,
            product_category: currentProduct.product_category,
            updated_at: new Date().toISOString(),
          })
          .eq("id", currentProduct.id)
          .eq("user_id", userId) // Ensure user can only update their own products

        if (error) {
          throw error
        }
        toast.success("Product updated successfully")
      } else {
        // Create new product
        const { error } = await supabase.from("products").insert({
          name: currentProduct.name,
          description: currentProduct.description,
          image_url: imageUrl,
          featured: currentProduct.featured || false,
          category: currentProduct.category,
          product_category: currentProduct.product_category,
          user_id: userId,
        })

        if (error) {
          throw error
        }
        toast.success("Product created successfully")
      }

      setIsEditing(false)
      fetchProducts()
      setCurrentProduct({
        name: "",
        description: "",
        image_url: "",
        featured: false,
        category: null,
        product_category: null,
      })
      setImageFile(null)
    } catch (error) {
      if (error instanceof Error) {
        toast.error(`Failed to save product: ${error.message}`)
      } else {
        toast.error("Failed to save product")
      }
    }
  }

  // Helper function to get category badge color
  const getCategoryColor = (category: string | null | undefined) => {
    switch (category) {
      case "Indica":
        return "bg-[#c9a3c8] text-white"
      case "Sativa":
        return "bg-[#c73b3a] text-white"
      case "Hybrid":
        return "bg-[#9bc3d8] text-white"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  // Helper function to get product category badge color
  const getProductCategoryColor = (category: string | null | undefined) => {
    switch (category) {
      case "Flower":
        return "bg-green-500 text-white"
      case "Pre-Rolls":
        return "bg-orange-500 text-white"
      case "Edibles":
        return "bg-pink-500 text-white"
      case "Merch":
        return "bg-blue-500 text-white"
      case "Concentrates":
        return "bg-purple-500 text-white"
      case "Vapes":
        return "bg-teal-500 text-white"
      default:
        return "bg-gray-200 text-gray-700"
    }
  }

  // Filter products by category
  const filteredProducts = filterCategory
    ? products.filter((product) => product.product_category === filterCategory)
    : products

  if (loading) {
    return <div className="text-center py-8">Loading products...</div>
  }

  return (
    <div className="admin-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Products</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Product
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentProduct.id ? "Edit Product" : "Create New Product"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>

          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name
              </label>
              <Input
                id="name"
                value={currentProduct.name || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, name: e.target.value })}
                placeholder="Enter product name"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <Textarea
                id="description"
                value={currentProduct.description || ""}
                onChange={(e) => setCurrentProduct({ ...currentProduct, description: e.target.value })}
                placeholder="Enter product description"
                className="min-h-[100px]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Strain Type
                </label>
                <Select
                  value={currentProduct.category || ""}
                  onValueChange={(value) =>
                    setCurrentProduct({
                      ...currentProduct,
                      category: value as "Indica" | "Sativa" | "Hybrid" | null,
                    })
                  }
                >
                  <SelectTrigger id="category">
                    <SelectValue placeholder="Select a strain type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Indica">Indica</SelectItem>
                    <SelectItem value="Sativa">Sativa</SelectItem>
                    <SelectItem value="Hybrid">Hybrid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label htmlFor="product_category" className="block text-sm font-medium text-gray-700 mb-1">
                  Product Category
                </label>
                <Select
                  value={currentProduct.product_category || ""}
                  onValueChange={(value) =>
                    setCurrentProduct({
                      ...currentProduct,
                      product_category: value as
                        | "Flower"
                        | "Pre-Rolls"
                        | "Edibles"
                        | "Merch"
                        | "Concentrates"
                        | "Vapes"
                        | null,
                    })
                  }
                >
                  <SelectTrigger id="product_category">
                    <SelectValue placeholder="Select a product category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Flower">Flower</SelectItem>
                    <SelectItem value="Pre-Rolls">Pre-Rolls</SelectItem>
                    <SelectItem value="Edibles">Edibles</SelectItem>
                    <SelectItem value="Merch">Merch</SelectItem>
                    <SelectItem value="Concentrates">Concentrates</SelectItem>
                    <SelectItem value="Vapes">Vapes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="featured"
                checked={currentProduct.featured || false}
                onCheckedChange={(checked) => setCurrentProduct({ ...currentProduct, featured: checked })}
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700 flex items-center">
                Featured Product <Star className="ml-1 h-4 w-4 text-yellow-400" />
              </label>
              <p className="text-xs text-gray-500 ml-2">(Featured products will appear on the homepage)</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Image</label>
              <ImageUploader
                existingImageUrl={currentProduct.image_url}
                onImageSelected={setImageFile}
                uploadProgress={uploadProgress}
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Product
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          {products.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg">
              <p className="text-gray-500 mb-4">No products yet</p>
              <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
                <PlusCircle className="mr-2 h-4 w-4" /> Add Your First Product
              </Button>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">Filter by Category</label>
                <div className="flex flex-wrap gap-2">
                  <Badge
                    className={`cursor-pointer ${!filterCategory ? "bg-[#ffd6c0]" : "bg-gray-200 hover:bg-gray-300"}`}
                    onClick={() => setFilterCategory(null)}
                  >
                    All
                  </Badge>
                  {["Flower", "Pre-Rolls", "Edibles", "Merch", "Concentrates", "Vapes"].map((category) => (
                    <Badge
                      key={category}
                      className={`cursor-pointer ${
                        filterCategory === category
                          ? getProductCategoryColor(category)
                          : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                      }`}
                      onClick={() => setFilterCategory(category)}
                    >
                      {category}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <CardContent className="p-0">
                      <div className="relative h-48">
                        <img
                          src={product.image_url || "/placeholder.svg?height=200&width=300"}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                        {product.featured && (
                          <div className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full flex items-center">
                            <Star className="h-3 w-3 mr-1" /> Featured
                          </div>
                        )}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {product.category && (
                            <div
                              className={`${getCategoryColor(product.category)} text-xs font-bold px-2 py-1 rounded-full`}
                            >
                              {product.category}
                            </div>
                          )}
                          {product.product_category && (
                            <div
                              className={`${getProductCategoryColor(
                                product.product_category,
                              )} text-xs font-bold px-2 py-1 rounded-full`}
                            >
                              {product.product_category}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="p-4">
                        <div className="mb-2">
                          <h3 className="text-lg font-semibold">{product.name}</h3>
                        </div>
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>

                        {/* Updated button layout to prevent cutoff */}
                        <div className="flex flex-col space-y-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className={`w-full justify-center ${product.featured ? "text-yellow-600" : "text-gray-500"}`}
                            onClick={() => handleToggleFeatured(product)}
                          >
                            <Star className={`h-4 w-4 mr-1 ${product.featured ? "fill-yellow-400" : ""}`} />
                            {product.featured ? "Featured" : "Feature"}
                          </Button>

                          <div className="grid grid-cols-2 gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center"
                              onClick={() => handleEdit(product)}
                            >
                              <Edit className="h-4 w-4 mr-1" /> Edit
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="w-full justify-center text-red-500 hover:text-red-700"
                              onClick={() => handleDelete(product.id)}
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
