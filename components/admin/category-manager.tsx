"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/utils/supabase"
import { PlusCircle, Edit, Trash2, Save, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
  is_active: boolean
  display_order: number
  color: string | null
}

export default function CategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [currentCategory, setCurrentCategory] = useState<Partial<Category>>({})

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase.from("product_categories").select("*").order("display_order")
      if (error) throw error
      setCategories(data || [])
    } catch (error) {
      toast.error("Failed to load categories")
    } finally {
      setLoading(false)
    }
  }

  const handleCreateNew = () => {
    setCurrentCategory({ name: "", is_active: true, display_order: categories.length + 1, color: "#6B7280" })
    setIsEditing(true)
  }

  const handleEdit = (category: Category) => {
    setCurrentCategory(category)
    setIsEditing(true)
  }

  const handleCancel = () => {
    setIsEditing(false)
    setCurrentCategory({})
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return

    try {
      const { error } = await supabase.from("product_categories").delete().eq("id", id)
      if (error) throw error
      toast.success("Category deleted successfully")
      fetchCategories()
    } catch (error) {
      toast.error("Failed to delete category.")
    }
  }

  const handleSave = async () => {
    if (!currentCategory.name) {
      toast.error("Category name is required")
      return
    }

    try {
      const { name, is_active, display_order, color } = currentCategory
      const upsertData = { name, is_active, display_order, color }

      if (currentCategory.id) {
        const { error } = await supabase.from("product_categories").update(upsertData).eq("id", currentCategory.id)
        if (error) throw error
        toast.success("Category updated successfully")
      } else {
        const { error } = await supabase.from("product_categories").insert(upsertData)
        if (error) throw error
        toast.success("Category created successfully")
      }

      setIsEditing(false)
      fetchCategories()
    } catch (error) {
      toast.error("Failed to save category.")
    }
  }

  if (loading) {
    return <div>Loading categories...</div>
  }

  return (
    <div className="admin-panel">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Product Categories</h2>
        {!isEditing && (
          <Button onClick={handleCreateNew} className="bg-[#a8d1e7] hover:bg-[#97c0d6]">
            <PlusCircle className="mr-2 h-4 w-4" /> New Category
          </Button>
        )}
      </div>

      {isEditing ? (
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold">{currentCategory.id ? "Edit Category" : "Create New Category"}</h3>
            <Button variant="ghost" onClick={handleCancel}>
              <X className="h-4 w-4 mr-2" /> Cancel
            </Button>
          </div>
          <div className="space-y-4">
            <Input
              placeholder="Category Name"
              value={currentCategory.name || ""}
              onChange={(e) => setCurrentCategory({ ...currentCategory, name: e.target.value })}
            />
            <Input
              type="number"
              placeholder="Display Order"
              value={currentCategory.display_order || ""}
              onChange={(e) =>
                setCurrentCategory({ ...currentCategory, display_order: Number.parseInt(e.target.value) })
              }
            />
            <div className="flex items-center space-x-2">
              <label htmlFor="color" className="text-sm font-medium text-gray-700">
                Category Color
              </label>
              <Input
                id="color"
                type="color"
                value={currentCategory.color || "#6B7280"}
                onChange={(e) => setCurrentCategory({ ...currentCategory, color: e.target.value })}
                className="p-1 h-10 w-14 block"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={currentCategory.is_active || false}
                onCheckedChange={(checked) => setCurrentCategory({ ...currentCategory, is_active: checked })}
              />
              <label htmlFor="is_active">Active</label>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={handleSave} className="bg-[#ffd6c0] hover:bg-[#ffcbb0]">
                <Save className="mr-2 h-4 w-4" /> Save Category
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div
                        className="w-4 h-4 rounded-full mr-3"
                        style={{ backgroundColor: category.color || "#cccccc" }}
                      ></div>
                      <span className="text-sm font-medium text-gray-900">{category.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <Button variant="outline" size="sm" onClick={() => handleEdit(category)}>
                      <Edit className="h-4 w-4 mr-1" /> Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 bg-transparent"
                      onClick={() => handleDelete(category.id)}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
